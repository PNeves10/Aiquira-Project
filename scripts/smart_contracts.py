from typing import Dict, Optional, Tuple, List
from dataclasses import dataclass
from datetime import datetime, timedelta
import json
import hashlib
from enum import Enum
import cv2
import face_recognition
import numpy as np
from web3 import Web3
from eth_account import Account
import requests
import pytesseract
from PIL import Image
import re
import hashlib
import hmac
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import os
import time

class ContractStatus(Enum):
    PENDING = "pending"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    DISPUTED = "disputed"
    EXPIRED = "expired"
    LOCKED = "locked"

class VerificationStatus(Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    FAILED = "failed"
    EXPIRED = "expired"
    SUSPICIOUS = "suspicious"

class DocumentType(Enum):
    PASSPORT = "passport"
    DRIVERS_LICENSE = "drivers_license"
    NATIONAL_ID = "national_id"
    RESIDENCE_PERMIT = "residence_permit"

class RegistrarType(Enum):
    NOMINALIA = "nominalia"
    GODADDY = "godaddy"
    NAME_CHEAP = "namecheap"
    GO_DADDY = "godaddy"
    HOVER = "hover"
    CLOUDFLARE = "cloudflare"

@dataclass
class ContractTerms:
    transfer_days: int
    escrow_period: int
    price_currency: str
    payment_methods: List[str]
    dispute_resolution: str
    jurisdiction: str
    governing_law: str
    force_majeure: bool
    intellectual_property: Dict
    confidentiality: bool
    non_compete: bool
    termination_conditions: List[str]
    renewal_terms: Dict
    service_level_agreement: Dict
    data_protection: Dict
    audit_rights: bool
    insurance_requirements: Dict
    compliance_requirements: List[str]
    technical_requirements: Dict
    transition_plan: Dict
    support_period: int
    training_requirements: Dict
    integration_requirements: Dict
    custom_development_needed: bool
    third_party_dependencies: List[str]
    data_migration_needed: bool
    hosting_requirements: Dict
    security_requirements: Dict
    compliance_requirements: List[str]
    performance_metrics: Dict
    uptime_percentage: float
    response_time: int
    error_rate: float
    user_satisfaction: float
    team_expertise: Dict
    code_quality: Dict
    test_coverage: float
    documentation_quality: Dict
    maintenance_requirements: Dict
    upgrade_path: Dict
    scalability_requirements: Dict
    security_vulnerabilities: List[str]
    performance_bottlenecks: List[str]
    technical_requirements: Dict
    business_requirements: Dict
    user_requirements: Dict
    market_requirements: Dict
    regulatory_requirements: Dict
    competitive_analysis: Dict
    market_analysis: Dict
    trend_analysis: Dict
    risk_analysis: Dict
    opportunity_analysis: Dict
    investment_analysis: Dict
    valuation_analysis: Dict
    due_diligence_analysis: Dict
    transition_analysis: Dict
    integration_analysis: Dict
    maintenance_analysis: Dict
    upgrade_analysis: Dict
    scalability_analysis: Dict
    security_analysis: Dict
    performance_analysis: Dict
    user_analysis: Dict
    team_analysis: Dict
    code_analysis: Dict
    documentation_analysis: Dict

@dataclass
class SmartContract:
    contract_id: str
    buyer_address: str
    seller_address: str
    asset_id: str
    price: float
    escrow_amount: float
    status: ContractStatus
    created_at: datetime
    completed_at: Optional[datetime] = None
    terms: ContractTerms = None
    verification_status: VerificationStatus = VerificationStatus.PENDING
    security_level: int = 1
    last_verification: Optional[datetime] = None
    verification_attempts: int = 0
    lock_until: Optional[datetime] = None

class SmartContractManager:
    def __init__(self, web3_provider: str, contract_address: str, abi_path: str):
        self.web3 = Web3(Web3.HTTPProvider(web3_provider))
        self.contract_address = contract_address
        with open(abi_path) as f:
            self.contract_abi = json.load(f)
        self.contract = self.web3.eth.contract(
            address=self.contract_address,
            abi=self.contract_abi
        )
        self.registrar_apis = {}
        self.encryption_key = self._generate_encryption_key()
        self.verification_threshold = 0.85
        self.max_verification_attempts = 3
        self.lock_duration = timedelta(hours=24)

    def _generate_encryption_key(self) -> bytes:
        """Generate encryption key for sensitive data"""
        salt = os.urandom(16)
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(os.urandom(32)))
        return key

    def setup_registrar_integration(self, registrar_type: RegistrarType, api_key: str, api_url: str):
        """Setup integration with domain registrar"""
        self.registrar_apis[registrar_type] = {
            'api_key': api_key,
            'api_url': api_url
        }

    def create_contract(self, buyer_address: str, seller_address: str, asset_id: str, 
                       price: float, terms: ContractTerms) -> SmartContract:
        """Create a new smart contract for asset transfer"""
        contract_id = hashlib.sha256(
            f"{buyer_address}{seller_address}{asset_id}{datetime.now().isoformat()}".encode()
        ).hexdigest()

        # Encrypt sensitive terms
        encrypted_terms = self._encrypt_terms(terms)

        # Create contract on blockchain
        tx_hash = self.contract.functions.createContract(
            buyer_address,
            seller_address,
            asset_id,
            self.web3.to_wei(price, 'ether'),
            encrypted_terms
        ).transact()

        # Wait for transaction to be mined
        receipt = self.web3.eth.wait_for_transaction_receipt(tx_hash)

        return SmartContract(
            contract_id=contract_id,
            buyer_address=buyer_address,
            seller_address=seller_address,
            asset_id=asset_id,
            price=price,
            escrow_amount=price * 0.1,  # 10% escrow
            status=ContractStatus.PENDING,
            created_at=datetime.now(),
            terms=terms
        )

    def _encrypt_terms(self, terms: ContractTerms) -> str:
        """Encrypt contract terms"""
        f = Fernet(self.encryption_key)
        terms_json = json.dumps(terms.__dict__)
        encrypted_terms = f.encrypt(terms_json.encode())
        return encrypted_terms.decode()

    def _decrypt_terms(self, encrypted_terms: str) -> ContractTerms:
        """Decrypt contract terms"""
        f = Fernet(self.encryption_key)
        decrypted_terms = f.decrypt(encrypted_terms.encode())
        terms_dict = json.loads(decrypted_terms)
        return ContractTerms(**terms_dict)

    def verify_identity(self, document_path: str, video_path: str, document_type: DocumentType) -> Tuple[bool, float, Dict]:
        """Enhanced identity verification with multiple checks"""
        if self._is_locked():
            return False, 0.0, {"error": "Account locked due to too many failed attempts"}

        # Document verification
        doc_verified, doc_details = self._verify_document(document_path, document_type)
        if not doc_verified:
            return False, 0.0, {"error": "Document verification failed", "details": doc_details}

        # Facial recognition
        face_verified, confidence = self._verify_face(document_path, video_path)
        if not face_verified:
            return False, 0.0, {"error": "Facial recognition failed", "confidence": confidence}

        # Liveness detection
        liveness_verified = self._detect_liveness(video_path)
        if not liveness_verified:
            return False, 0.0, {"error": "Liveness detection failed"}

        # OCR and data extraction
        extracted_data = self._extract_document_data(document_path, document_type)
        if not extracted_data:
            return False, 0.0, {"error": "Data extraction failed"}

        # Anti-spoofing checks
        spoof_check = self._check_for_spoofing(document_path, video_path)
        if not spoof_check:
            return False, 0.0, {"error": "Spoofing detected"}

        return True, confidence, {
            "document_verified": True,
            "face_verified": True,
            "liveness_verified": True,
            "extracted_data": extracted_data,
            "confidence": confidence
        }

    def _verify_document(self, document_path: str, document_type: DocumentType) -> Tuple[bool, Dict]:
        """Enhanced document verification"""
        image = cv2.imread(document_path)
        
        # Basic document structure verification
        structure_verified = self._verify_document_structure(image, document_type)
        if not structure_verified:
            return False, {"error": "Document structure verification failed"}

        # Security features verification
        security_verified = self._verify_security_features(image, document_type)
        if not security_verified:
            return False, {"error": "Security features verification failed"}

        # Data consistency check
        data_consistent = self._check_data_consistency(image, document_type)
        if not data_consistent:
            return False, {"error": "Data consistency check failed"}

        return True, {
            "structure_verified": True,
            "security_verified": True,
            "data_consistent": True
        }

    def _verify_face(self, document_path: str, video_path: str) -> Tuple[bool, float]:
        """Enhanced facial recognition"""
        document_image = face_recognition.load_image_file(document_path)
        document_encoding = face_recognition.face_encodings(document_image)
        
        if not document_encoding:
            return False, 0.0
        
        video_capture = cv2.VideoCapture(video_path)
        frame_count = 0
        matches = []
        confidence_scores = []
        
        while True:
            ret, frame = video_capture.read()
            if not ret:
                break
                
            if frame_count % 5 == 0:
                rgb_frame = frame[:, :, ::-1]
                face_locations = face_recognition.face_locations(rgb_frame)
                face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)
                
                for face_encoding in face_encodings:
                    match = face_recognition.compare_faces(
                        document_encoding, 
                        face_encoding,
                        tolerance=0.6
                    )
                    if match[0]:
                        matches.append(True)
                        # Calculate confidence score
                        face_distance = face_recognition.face_distance(document_encoding, face_encoding)
                        confidence_scores.append(1 - face_distance[0])
                    else:
                        matches.append(False)
                        confidence_scores.append(0.0)
            
            frame_count += 1
        
        video_capture.release()
        
        if not matches:
            return False, 0.0
            
        confidence = sum(confidence_scores) / len(confidence_scores)
        return confidence > self.verification_threshold, confidence

    def _detect_liveness(self, video_path: str) -> bool:
        """Detect if the video is from a live person"""
        video_capture = cv2.VideoCapture(video_path)
        frame_count = 0
        motion_detected = False
        
        # Get first frame
        ret, prev_frame = video_capture.read()
        if not ret:
            return False
            
        while True:
            ret, frame = video_capture.read()
            if not ret:
                break
                
            if frame_count % 5 == 0:
                # Convert frames to grayscale
                prev_gray = cv2.cvtColor(prev_frame, cv2.COLOR_BGR2GRAY)
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                
                # Calculate absolute difference
                diff = cv2.absdiff(prev_gray, gray)
                
                # Apply threshold
                thresh = cv2.threshold(diff, 25, 255, cv2.THRESH_BINARY)[1]
                
                # Count non-zero pixels
                if cv2.countNonZero(thresh) > 1000:
                    motion_detected = True
                    break
                
                prev_frame = frame.copy()
            
            frame_count += 1
        
        video_capture.release()
        return motion_detected

    def _extract_document_data(self, document_path: str, document_type: DocumentType) -> Dict:
        """Extract data from document using OCR"""
        image = cv2.imread(document_path)
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Apply preprocessing
        gray = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
        
        # Extract text using Tesseract
        text = pytesseract.image_to_string(gray)
        
        # Extract relevant data based on document type
        data = {}
        if document_type == DocumentType.PASSPORT:
            data.update(self._extract_passport_data(text))
        elif document_type == DocumentType.DRIVERS_LICENSE:
            data.update(self._extract_drivers_license_data(text))
        elif document_type == DocumentType.NATIONAL_ID:
            data.update(self._extract_national_id_data(text))
            
        return data

    def _check_for_spoofing(self, document_path: str, video_path: str) -> bool:
        """Check for potential spoofing attempts"""
        # Check for printed photos
        document_image = cv2.imread(document_path)
        if self._detect_printed_photo(document_image):
            return False
            
        # Check for screen reflections in video
        video_capture = cv2.VideoCapture(video_path)
        screen_detected = False
        
        while True:
            ret, frame = video_capture.read()
            if not ret:
                break
                
            if self._detect_screen_reflection(frame):
                screen_detected = True
                break
        
        video_capture.release()
        return not screen_detected

    def _is_locked(self) -> bool:
        """Check if account is locked due to too many failed attempts"""
        if self.verification_attempts >= self.max_verification_attempts:
            if not self.lock_until or datetime.now() < self.lock_until:
                return True
            else:
                self.verification_attempts = 0
                self.lock_until = None
        return False

    def verify_domain_transfer(self, domain: str, registrar_type: RegistrarType) -> bool:
        """Verify domain transfer status with registrar"""
        if registrar_type not in self.registrar_apis:
            raise ValueError(f"Registrar {registrar_type} not configured")
            
        api_config = self.registrar_apis[registrar_type]
        headers = {
            "Authorization": f"Bearer {api_config['api_key']}",
            "Content-Type": "application/json"
        }
        
        try:
            response = requests.get(
                f"{api_config['api_url']}/domains/{domain}/transfer-status",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get("transfer_complete", False)
        except requests.RequestException:
            return False
            
        return False

    def release_payment(self, contract: SmartContract) -> bool:
        """Release payment after successful transfer and verification"""
        if contract.status != ContractStatus.ACTIVE:
            return False
            
        # Verify domain transfer with all configured registrars
        transfer_verified = False
        for registrar_type in self.registrar_apis:
            if self.verify_domain_transfer(contract.asset_id, registrar_type):
                transfer_verified = True
                break
                
        if not transfer_verified:
            return False
            
        # Release payment on blockchain
        tx_hash = self.contract.functions.releasePayment(
            contract.contract_id
        ).transact()
        
        receipt = self.web3.eth.wait_for_transaction_receipt(tx_hash)
        
        if receipt.status == 1:
            contract.status = ContractStatus.COMPLETED
            contract.completed_at = datetime.now()
            return True
        return False

    def dispute_contract(self, contract: SmartContract, reason: str) -> bool:
        """Initiate contract dispute with enhanced security"""
        if contract.status not in [ContractStatus.ACTIVE, ContractStatus.PENDING]:
            return False
            
        # Verify dispute reason
        if not self._validate_dispute_reason(reason):
            return False
            
        # Create dispute hash
        dispute_hash = hashlib.sha256(
            f"{contract.contract_id}{reason}{datetime.now().isoformat()}".encode()
        ).hexdigest()
            
        tx_hash = self.contract.functions.initiateDispute(
            contract.contract_id,
            dispute_hash
        ).transact()
        
        receipt = self.web3.eth.wait_for_transaction_receipt(tx_hash)
        
        if receipt.status == 1:
            contract.status = ContractStatus.DISPUTED
            return True
        return False

    def _validate_dispute_reason(self, reason: str) -> bool:
        """Validate dispute reason"""
        # Check for minimum length
        if len(reason) < 20:
            return False
            
        # Check for specific keywords
        valid_keywords = ["breach", "violation", "failure", "non-compliance", "misrepresentation"]
        if not any(keyword in reason.lower() for keyword in valid_keywords):
            return False
            
        return True

    def get_contract_status(self, contract_id: str) -> ContractStatus:
        """Get current contract status from blockchain"""
        status = self.contract.functions.getContractStatus(contract_id).call()
        return ContractStatus(status)

    def get_contract_balance(self, contract_id: str) -> float:
        """Get current contract balance in escrow"""
        balance = self.contract.functions.getContractBalance(contract_id).call()
        return self.web3.from_wei(balance, 'ether')

class IdentityVerifier:
    def __init__(self):
        self.known_faces: Dict[str, List[np.ndarray]] = {}
        self.verification_threshold = 0.7

    def add_known_face(self, user_id: str, image_path: str):
        """Add a known face for future verification"""
        image = face_recognition.load_image_file(image_path)
        encodings = face_recognition.face_encodings(image)
        
        if encodings:
            if user_id not in self.known_faces:
                self.known_faces[user_id] = []
            self.known_faces[user_id].extend(encodings)

    def verify_live_face(self, user_id: str, video_path: str) -> Tuple[bool, float]:
        """Verify live video against known face"""
        if user_id not in self.known_faces:
            return False, 0.0
            
        video_capture = cv2.VideoCapture(video_path)
        frame_count = 0
        matches = []
        
        while True:
            ret, frame = video_capture.read()
            if not ret:
                break
                
            if frame_count % 5 == 0:
                rgb_frame = frame[:, :, ::-1]
                face_locations = face_recognition.face_locations(rgb_frame)
                face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)
                
                for face_encoding in face_encodings:
                    for known_encoding in self.known_faces[user_id]:
                        match = face_recognition.compare_faces(
                            [known_encoding],
                            face_encoding,
                            tolerance=0.6
                        )
                        if match[0]:
                            matches.append(True)
                        else:
                            matches.append(False)
            
            frame_count += 1
        
        video_capture.release()
        
        if not matches:
            return False, 0.0
            
        confidence = sum(matches) / len(matches)
        return confidence > self.verification_threshold, confidence

    def verify_document(self, document_path: str, document_type: str) -> bool:
        """Verify document authenticity"""
        # Load and process document
        image = cv2.imread(document_path)
        
        # Basic document verification
        if document_type.lower() == "id":
            # Check for common ID features
            # This is a simplified example - real implementation would be more robust
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            edges = cv2.Canny(gray, 50, 150)
            
            # Look for rectangular shape (typical ID card)
            contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            for contour in contours:
                perimeter = cv2.arcLength(contour, True)
                approx = cv2.approxPolyDP(contour, 0.02 * perimeter, True)
                if len(approx) == 4:  # Rectangle has 4 corners
                    return True
                    
        return False 