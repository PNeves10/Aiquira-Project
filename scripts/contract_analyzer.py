from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import spacy
import pandas as pd
import numpy as np
from datetime import datetime
import re
from pathlib import Path
import json
from jinja2 import Template, Environment, FileSystemLoader

class ContractType(Enum):
    INSTALLMENT_SALE = "Installment Sale"
    NON_COMPETE = "Non-Compete Agreement"
    ASSET_PURCHASE = "Asset Purchase"
    SHARE_PURCHASE = "Share Purchase"
    EARNOUT = "Earnout Agreement"
    CONSULTING = "Consulting Agreement"
    ESCROW = "Escrow Agreement"
    SPA = "Share Purchase Agreement"
    APA = "Asset Purchase Agreement"
    EMPLOYMENT = "Employment Agreement"

@dataclass
class ContractTemplate:
    type: ContractType
    name: str
    description: str
    variables: Dict[str, str]
    content: str
    default_values: Dict[str, Any]

@dataclass
class ContractAnalysis:
    inconsistencies: List[Dict[str, Any]]
    risk_factors: List[Dict[str, str]]
    missing_clauses: List[str]
    suggested_changes: List[Dict[str, str]]
    confidence_score: float

@dataclass
class TransactionCosts:
    total_amount: float
    taxes: Dict[str, float]
    fees: Dict[str, float]
    net_amount: float
    tax_breakdown: Dict[str, str]
    jurisdiction: str

class ContractAnalyzer:
    def __init__(self):
        """Initialize the Contract Analyzer with NLP models and templates."""
        # Load NLP models
        self.nlp = spacy.load("en_core_web_trf")
        
        # Initialize template system
        self.env = Environment(loader=FileSystemLoader("templates"))
        self.templates = self._load_contract_templates()
        
        # Load tax rules
        self.tax_rules = self._load_tax_rules()

    def _load_contract_templates(self) -> Dict[str, ContractTemplate]:
        """Load predefined contract templates."""
        templates = {}
        
        # Installment Sale Template
        templates["installment_sale"] = ContractTemplate(
            type=ContractType.INSTALLMENT_SALE,
            name="Installment Sale Agreement",
            description="Template for selling assets or shares with payment in installments",
            variables={
                "seller_name": "Legal name of the seller",
                "buyer_name": "Legal name of the buyer",
                "total_amount": "Total sale amount",
                "installment_count": "Number of installments",
                "interest_rate": "Annual interest rate",
                "payment_frequency": "Payment frequency (monthly/quarterly)",
                "collateral": "Description of collateral",
                "late_payment_penalty": "Late payment penalty percentage"
            },
            content="""
            INSTALLMENT SALE AGREEMENT
            
            This Agreement is made on {{ date }} between {{ seller_name }} ("Seller") 
            and {{ buyer_name }} ("Buyer").
            
            1. SALE AND PURCHASE
            The Seller agrees to sell and the Buyer agrees to purchase the Asset for 
            € {{ total_amount }}, payable in {{ installment_count }} installments.
            
            2. PAYMENT TERMS
            2.1 The Buyer shall pay the purchase price in {{ installment_count }} 
            {{ payment_frequency }} installments of € {{ installment_amount }} each.
            2.2 Interest shall accrue at {{ interest_rate }}% per annum.
            2.3 Late payments shall incur a penalty of {{ late_payment_penalty }}%.
            
            3. COLLATERAL
            The following collateral shall secure the payment obligations:
            {{ collateral }}
            """,
            default_values={
                "interest_rate": 5.0,
                "payment_frequency": "monthly",
                "late_payment_penalty": 2.0
            }
        )
        
        # Non-Compete Template
        templates["non_compete"] = ContractTemplate(
            type=ContractType.NON_COMPETE,
            name="Non-Compete Agreement",
            description="Template for non-compete agreements in business sales",
            variables={
                "restricted_party": "Name of the party bound by non-compete",
                "protected_party": "Name of the party protected by non-compete",
                "duration_months": "Duration in months",
                "territory": "Geographic scope",
                "business_description": "Description of restricted business activities",
                "compensation": "Compensation for non-compete",
                "penalty_amount": "Penalty for violation"
            },
            content="""
            NON-COMPETE AGREEMENT
            
            This Agreement is made on {{ date }} between {{ restricted_party }} 
            ("Restricted Party") and {{ protected_party }} ("Protected Party").
            
            1. NON-COMPETE OBLIGATION
            The Restricted Party agrees not to engage in {{ business_description }} 
            within {{ territory }} for {{ duration_months }} months.
            
            2. COMPENSATION
            In consideration for this restriction, Protected Party shall pay 
            € {{ compensation }}.
            
            3. PENALTY
            Violation of this agreement shall result in a penalty of € {{ penalty_amount }}.
            """,
            default_values={
                "duration_months": 24,
                "penalty_amount": 100000
            }
        )
        
        # Share Purchase Agreement Template
        templates["spa"] = ContractTemplate(
            type=ContractType.SPA,
            name="Share Purchase Agreement",
            description="Comprehensive template for share purchase transactions",
            variables={
                "seller_name": "Legal name of the seller",
                "buyer_name": "Legal name of the buyer",
                "company_name": "Name of the target company",
                "share_count": "Number of shares being sold",
                "share_price": "Price per share",
                "total_amount": "Total purchase price",
                "payment_terms": "Terms of payment",
                "warranties": "Seller warranties",
                "conditions_precedent": "Conditions to be met before closing",
                "closing_date": "Expected closing date"
            },
            content="""
            SHARE PURCHASE AGREEMENT

            This Share Purchase Agreement (the "Agreement") is made on {{ date }} between 
            {{ seller_name }} ("Seller") and {{ buyer_name }} ("Buyer").

            1. SALE AND PURCHASE OF SHARES
            1.1 The Seller agrees to sell and the Buyer agrees to purchase {{ share_count }} 
            shares in {{ company_name }} (the "Company") at € {{ share_price }} per share, 
            for a total consideration of € {{ total_amount }}.

            2. PAYMENT TERMS
            {{ payment_terms }}

            3. CONDITIONS PRECEDENT
            The completion of this Agreement is subject to:
            {{ conditions_precedent }}

            4. WARRANTIES
            The Seller warrants that:
            {{ warranties }}

            5. CLOSING
            5.1 The closing shall take place on {{ closing_date }}.
            """,
            default_values={
                "warranties": """
                a) The Seller has full title to the shares
                b) The shares are free from encumbrances
                c) The Company's accounts are true and fair
                d) There are no undisclosed liabilities
                """,
                "conditions_precedent": """
                a) Due diligence completion
                b) Regulatory approvals
                c) No material adverse change
                """
            }
        )

        # Escrow Agreement Template
        templates["escrow"] = ContractTemplate(
            type=ContractType.ESCROW,
            name="Escrow Agreement",
            description="Template for escrow arrangements in business transactions",
            variables={
                "seller_name": "Legal name of the seller",
                "buyer_name": "Legal name of the buyer",
                "escrow_agent": "Name of the escrow agent",
                "escrow_amount": "Amount to be held in escrow",
                "escrow_period": "Duration of escrow period",
                "release_conditions": "Conditions for releasing escrow funds",
                "agent_fees": "Escrow agent fees"
            },
            content="""
            ESCROW AGREEMENT

            This Escrow Agreement is made on {{ date }} between {{ seller_name }} ("Seller"), 
            {{ buyer_name }} ("Buyer"), and {{ escrow_agent }} ("Escrow Agent").

            1. ESCROW AMOUNT AND PERIOD
            1.1 The Buyer shall deposit € {{ escrow_amount }} with the Escrow Agent.
            1.2 The escrow period shall be {{ escrow_period }} months.

            2. RELEASE CONDITIONS
            The Escrow Agent shall release the funds upon:
            {{ release_conditions }}

            3. ESCROW AGENT FEES
            3.1 The Escrow Agent's fees shall be € {{ agent_fees }}.
            """,
            default_values={
                "escrow_period": 12,
                "release_conditions": """
                a) Written instruction from both parties
                b) Court order
                c) Satisfaction of specified conditions
                """
            }
        )

        # Employment Agreement Template
        templates["employment"] = ContractTemplate(
            type=ContractType.EMPLOYMENT,
            name="Employment Agreement",
            description="Template for key employee contracts in business acquisitions",
            variables={
                "employer_name": "Legal name of the employer",
                "employee_name": "Name of the employee",
                "position": "Job position/title",
                "start_date": "Employment start date",
                "base_salary": "Annual base salary",
                "bonus_terms": "Performance bonus terms",
                "benefits": "Additional benefits",
                "notice_period": "Notice period for termination"
            },
            content="""
            EMPLOYMENT AGREEMENT

            This Employment Agreement is made on {{ date }} between {{ employer_name }} 
            ("Employer") and {{ employee_name }} ("Employee").

            1. POSITION AND DUTIES
            1.1 Position: {{ position }}
            1.2 Start Date: {{ start_date }}

            2. COMPENSATION
            2.1 Base Salary: € {{ base_salary }} per annum
            2.2 Bonus: {{ bonus_terms }}
            2.3 Benefits: {{ benefits }}

            3. TERMINATION
            Notice Period: {{ notice_period }} months
            """,
            default_values={
                "notice_period": 3,
                "benefits": """
                a) Health insurance
                b) Pension contribution
                c) Annual leave: 22 days
                """
            }
        )

        return templates

    def _load_tax_rules(self) -> Dict[str, Any]:
        """Load tax rules for different jurisdictions."""
        return {
            "portugal": {
                "capital_gains": {
                    "rate": 0.28,  # 28% for individuals
                    "corporate_rate": 0.21,  # 21% for companies
                    "exemptions": {
                        "reinvestment": 0.50,  # 50% exemption if reinvested
                        "holding_period": 24,  # months
                        "participation": {
                            "threshold": 0.10,  # 10% ownership
                            "holding_period": 12  # months
                        },
                        "startup_benefit": {
                            "rate_reduction": 0.14,  # 14% reduction for startups
                            "max_age_months": 48  # 4 years
                        }
                    },
                    "progressive_rates": {  # For individuals
                        "brackets": [
                            {"threshold": 10000, "rate": 0.14},
                            {"threshold": 50000, "rate": 0.28},
                            {"threshold": 100000, "rate": 0.35},
                            {"threshold": float('inf'), "rate": 0.48}
                        ]
                    }
                },
                "stamp_duty": {
                    "rate": 0.006,  # 0.6% on sale value
                    "thresholds": {
                        "standard": 0.006,
                        "real_estate": 0.008,
                        "financial": 0.004
                    },
                    "exemptions": [
                        "group_restructuring",
                        "startup_transfer",
                        "family_business"
                    ]
                },
                "vat": {
                    "standard_rate": 0.23,
                    "intermediate_rate": 0.13,
                    "reduced_rate": 0.06,
                    "exemptions": [
                        "share_sale",
                        "business_transfer",
                        "financial_services"
                    ]
                },
                "municipal_tax": {
                    "rate": 0.005,  # 0.5% on property value
                    "brackets": [
                        {"threshold": 500000, "rate": 0.007},
                        {"threshold": 1000000, "rate": 0.01},
                        {"threshold": float('inf'), "rate": 0.015}
                    ]
                },
                "special_regimes": {
                    "startup_benefits": {
                        "active": True,
                        "max_age_months": 48,
                        "tax_reduction": 0.50
                    },
                    "tech_transfer": {
                        "active": True,
                        "rate_reduction": 0.30
                    },
                    "rd_incentives": {
                        "active": True,
                        "rate_reduction": 0.25
                    }
                }
            },
            "spain": {
                "capital_gains": {
                    "rate": 0.26,  # 26% for individuals (2024)
                    "corporate_rate": 0.25,  # 25% for companies
                    "exemptions": {
                        "reinvestment": 0.60,  # 60% exemption if reinvested
                        "holding_period": 12,  # months
                        "participation": {
                            "threshold": 0.05,  # 5% ownership
                            "holding_period": 12  # months
                        },
                        "startup_benefit": {
                            "rate_reduction": 0.15,  # 15% reduction for startups
                            "max_age_months": 36  # 3 years
                        }
                    },
                    "progressive_rates": {  # For individuals
                        "brackets": [
                            {"threshold": 6000, "rate": 0.19},
                            {"threshold": 50000, "rate": 0.21},
                            {"threshold": 200000, "rate": 0.23},
                            {"threshold": float('inf'), "rate": 0.26}
                        ]
                    }
                },
                "stamp_duty": {
                    "rate": 0.01,  # 1% on sale value
                    "thresholds": {
                        "standard": 0.01,
                        "real_estate": 0.015,
                        "financial": 0.008
                    },
                    "exemptions": [
                        "group_restructuring",
                        "startup_transfer",
                        "family_business",
                        "innovation_projects"
                    ]
                },
                "vat": {
                    "standard_rate": 0.21,
                    "intermediate_rate": 0.10,
                    "reduced_rate": 0.04,
                    "exemptions": [
                        "share_sale",
                        "business_transfer",
                        "financial_services",
                        "educational_services"
                    ]
                },
                "municipal_tax": {
                    "rate": 0.003,  # 0.3% on property value
                    "brackets": [
                        {"threshold": 300000, "rate": 0.004},
                        {"threshold": 600000, "rate": 0.006},
                        {"threshold": float('inf'), "rate": 0.008}
                    ]
                },
                "special_regimes": {
                    "startup_benefits": {
                        "active": True,
                        "max_age_months": 36,
                        "tax_reduction": 0.40
                    },
                    "tech_transfer": {
                        "active": True,
                        "rate_reduction": 0.25
                    },
                    "rd_incentives": {
                        "active": True,
                        "rate_reduction": 0.30,
                        "additional_deduction": 0.12
                    }
                }
            },
            "france": {
                "capital_gains": {
                    "rate": 0.30,  # 30% flat tax for individuals
                    "corporate_rate": 0.25,  # 25% for companies
                    "exemptions": {
                        "reinvestment": 0.85,  # 85% exemption if reinvested
                        "holding_period": 24,  # months
                        "participation": {
                            "threshold": 0.05,  # 5% ownership
                            "holding_period": 24  # months
                        },
                        "retirement_benefit": {
                            "rate_reduction": 0.50,  # 50% reduction for retirement
                            "min_holding_period": 48  # months
                        }
                    },
                    "progressive_rates": {  # For individuals (optional regime)
                        "brackets": [
                            {"threshold": 10225, "rate": 0.11},
                            {"threshold": 26070, "rate": 0.30},
                            {"threshold": 74545, "rate": 0.41},
                            {"threshold": 160336, "rate": 0.45},
                            {"threshold": float('inf'), "rate": 0.49}
                        ]
                    }
                },
                "stamp_duty": {
                    "rate": 0.01,  # 1% on sale value
                    "thresholds": {
                        "standard": 0.01,
                        "real_estate": 0.057,  # 5.7% for real estate
                        "financial": 0.005
                    },
                    "exemptions": [
                        "group_restructuring",
                        "young_innovative_company",
                        "family_business"
                    ]
                },
                "vat": {
                    "standard_rate": 0.20,
                    "intermediate_rate": 0.10,
                    "reduced_rate": 0.055,
                    "super_reduced_rate": 0.021,
                    "exemptions": [
                        "share_sale",
                        "business_transfer",
                        "financial_services",
                        "medical_services"
                    ]
                },
                "social_contributions": {
                    "csg_crds": 0.172,  # 17.2% social contributions
                    "professional_tax": {
                        "base_rate": 0.015,
                        "max_rate": 0.03
                    }
                },
                "special_regimes": {
                    "young_innovative_company": {
                        "active": True,
                        "max_age_months": 96,  # 8 years
                        "tax_reduction": 0.60,
                        "social_charges_exemption": 0.80
                    },
                    "rd_incentives": {
                        "active": True,
                        "rate_reduction": 0.30,
                        "enhanced_rate": 0.50,  # For startups
                        "max_benefit": 100000000  # €100M cap
                    },
                    "territorial_aid": {
                        "active": True,
                        "rate_reduction": {
                            "priority_zones": 0.45,
                            "development_zones": 0.35
                        }
                    }
                }
            }
        }

    def create_contract(self, template_type: ContractType, variables: Dict[str, Any]) -> str:
        """Create a contract from a template with provided variables."""
        template = self.templates[template_type.value.lower().replace(" ", "_")]
        
        # Validate required variables
        missing_vars = [var for var in template.variables if var not in variables]
        if missing_vars:
            raise ValueError(f"Missing required variables: {', '.join(missing_vars)}")
        
        # Apply default values for missing optional variables
        for key, value in template.default_values.items():
            if key not in variables:
                variables[key] = value
        
        # Add current date if not provided
        if "date" not in variables:
            variables["date"] = datetime.now().strftime("%Y-%m-%d")
        
        # Generate contract
        template_obj = Template(template.content)
        return template_obj.render(**variables)

    def analyze_contract(self, contract_text: str, agreed_terms: Dict[str, Any]) -> ContractAnalysis:
        """Analyze contract for inconsistencies and risks."""
        doc = self.nlp(contract_text)
        
        inconsistencies = []
        risk_factors = []
        missing_clauses = []
        suggested_changes = []
        
        # Check for value inconsistencies
        monetary_values = self._extract_monetary_values(doc)
        for value_type, value in agreed_terms.items():
            if isinstance(value, (int, float)):
                matching_values = [v for v in monetary_values if abs(v - value) > 0.01]
                if matching_values:
                    inconsistencies.append({
                        "type": "value_mismatch",
                        "agreed_value": value,
                        "found_values": matching_values,
                        "context": value_type
                    })
        
        # Check for missing standard clauses
        standard_clauses = {
            "governing_law": r"governing law|applicable law",
            "dispute_resolution": r"dispute|arbitration|jurisdiction",
            "termination": r"termination|terminate",
            "confidentiality": r"confidential|confidentiality"
        }
        
        for clause, pattern in standard_clauses.items():
            if not re.search(pattern, contract_text, re.IGNORECASE):
                missing_clauses.append(clause)
        
        # Identify potential risks
        risk_patterns = {
            "unlimited_liability": r"unlimited liability|unlimited obligation",
            "perpetual_obligation": r"perpetual|indefinite period|unlimited duration",
            "unilateral_changes": r"sole discretion|unilateral|without notice"
        }
        
        for risk_type, pattern in risk_patterns.items():
            if re.search(pattern, contract_text, re.IGNORECASE):
                risk_factors.append({
                    "type": risk_type,
                    "severity": "high",
                    "description": f"Found {risk_type.replace('_', ' ')} clause"
                })
        
        # Calculate confidence score
        confidence_score = self._calculate_confidence_score(
            len(inconsistencies),
            len(risk_factors),
            len(missing_clauses)
        )
        
        return ContractAnalysis(
            inconsistencies=inconsistencies,
            risk_factors=risk_factors,
            missing_clauses=missing_clauses,
            suggested_changes=suggested_changes,
            confidence_score=confidence_score
        )

    def simulate_transaction(self, 
                           amount: float,
                           transaction_type: str,
                           jurisdiction: str = "portugal",
                           seller_type: str = "individual",
                           buyer_type: str = "company",
                           asset_type: str = "shares",
                           holding_period_months: int = 0,
                           company_age_months: Optional[int] = None,
                           ownership_percentage: Optional[float] = None,
                           is_tech_transfer: bool = False,
                           has_rd_component: bool = False,
                           property_value: Optional[float] = None) -> TransactionCosts:
        """Simulate transaction costs including taxes and fees with enhanced rules."""
        tax_rules = self.tax_rules[jurisdiction.lower()]
        taxes = {}
        fees = {}
        tax_benefits = []
        
        # Calculate Capital Gains Tax with progressive rates for individuals
        if seller_type == "individual":
            taxes["capital_gains"] = self._calculate_progressive_tax(
                amount, 
                tax_rules["capital_gains"]["progressive_rates"]["brackets"]
            )
        else:
            base_rate = tax_rules["capital_gains"]["corporate_rate"]
            
            # Apply participation exemption
            if (ownership_percentage and 
                ownership_percentage >= tax_rules["capital_gains"]["exemptions"]["participation"]["threshold"] and
                holding_period_months >= tax_rules["capital_gains"]["exemptions"]["participation"]["holding_period"]):
                base_rate = 0
                tax_benefits.append("Participation exemption applied")
            
            # Apply startup benefits
            if (company_age_months and 
                company_age_months <= tax_rules["capital_gains"]["exemptions"]["startup_benefit"]["max_age_months"]):
                reduction = tax_rules["capital_gains"]["exemptions"]["startup_benefit"]["rate_reduction"]
                base_rate *= (1 - reduction)
                tax_benefits.append(f"Startup benefit applied: {reduction*100}% reduction")
            
            taxes["capital_gains"] = amount * base_rate
        
        # Calculate Stamp Duty with exemptions
        if asset_type == "real_estate":
            stamp_rate = tax_rules["stamp_duty"]["thresholds"]["real_estate"]
        elif asset_type == "financial":
            stamp_rate = tax_rules["stamp_duty"]["thresholds"]["financial"]
        else:
            stamp_rate = tax_rules["stamp_duty"]["thresholds"]["standard"]
        
        # Check for stamp duty exemptions
        if transaction_type in tax_rules["stamp_duty"]["exemptions"]:
            stamp_rate = 0
            tax_benefits.append(f"Stamp duty exemption applied for {transaction_type}")
        
        taxes["stamp_duty"] = amount * stamp_rate
        
        # Calculate VAT if applicable
        if asset_type not in tax_rules["vat"]["exemptions"]:
            if is_tech_transfer:
                vat_rate = tax_rules["vat"]["reduced_rate"]
                tax_benefits.append("Reduced VAT rate applied for tech transfer")
            else:
                vat_rate = tax_rules["vat"]["standard_rate"]
            taxes["vat"] = amount * vat_rate
        
        # Calculate Municipal Tax for real estate
        if property_value:
            municipal_tax = self._calculate_progressive_tax(
                property_value,
                tax_rules["municipal_tax"]["brackets"]
            )
            taxes["municipal_tax"] = municipal_tax
        
        # Apply Special Regimes
        if tax_rules["special_regimes"]["startup_benefits"]["active"] and company_age_months:
            if company_age_months <= tax_rules["special_regimes"]["startup_benefits"]["max_age_months"]:
                reduction = tax_rules["special_regimes"]["startup_benefits"]["tax_reduction"]
                for tax_type in taxes:
                    taxes[tax_type] *= (1 - reduction)
                tax_benefits.append(f"Startup regime applied: {reduction*100}% reduction on all taxes")
        
        if tax_rules["special_regimes"]["tech_transfer"]["active"] and is_tech_transfer:
            reduction = tax_rules["special_regimes"]["tech_transfer"]["rate_reduction"]
            for tax_type in taxes:
                taxes[tax_type] *= (1 - reduction)
            tax_benefits.append(f"Tech transfer benefits applied: {reduction*100}% reduction")
        
        if tax_rules["special_regimes"]["rd_incentives"]["active"] and has_rd_component:
            reduction = tax_rules["special_regimes"]["rd_incentives"]["rate_reduction"]
            for tax_type in taxes:
                taxes[tax_type] *= (1 - reduction)
            tax_benefits.append(f"R&D incentives applied: {reduction*100}% reduction")
        
        # Calculate professional fees (estimated)
        fees["legal"] = min(amount * 0.01, 5000)  # 1% capped at €5000
        fees["accounting"] = min(amount * 0.005, 2500)  # 0.5% capped at €2500
        if property_value:
            fees["notary"] = min(property_value * 0.003, 1500)  # 0.3% capped at €1500
        
        # Calculate totals
        total_taxes = sum(taxes.values())
        total_fees = sum(fees.values())
        net_amount = amount - total_taxes - total_fees
        
        # Prepare tax breakdown explanation
        tax_breakdown = {
            tax_type: f"{tax_type.replace('_', ' ').title()}: {value:,.2f}€"
            for tax_type, value in taxes.items()
        }
        
        # Add benefits explanation
        if tax_benefits:
            tax_breakdown["benefits"] = "Applied Benefits:\n" + "\n".join(f"- {benefit}" for benefit in tax_benefits)
        
        return TransactionCosts(
            total_amount=amount,
            taxes=taxes,
            fees=fees,
            net_amount=net_amount,
            tax_breakdown=tax_breakdown,
            jurisdiction=jurisdiction
        )

    def _calculate_progressive_tax(self, amount: float, brackets: List[Dict[str, float]]) -> float:
        """Calculate tax using progressive brackets."""
        total_tax = 0
        remaining_amount = amount
        
        for bracket in brackets:
            if remaining_amount <= 0:
                break
            
            taxable_in_bracket = min(remaining_amount, bracket["threshold"])
            tax_in_bracket = taxable_in_bracket * bracket["rate"]
            
            total_tax += tax_in_bracket
            remaining_amount -= taxable_in_bracket
        
        return total_tax

    def _extract_monetary_values(self, doc) -> List[float]:
        """Extract monetary values from spaCy doc."""
        values = []
        amount_pattern = r'€\s*(\d+(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)'
        
        for match in re.finditer(amount_pattern, doc.text):
            value_str = match.group(1).replace(',', '')
            values.append(float(value_str))
        
        return values

    def _calculate_confidence_score(self, 
                                 inconsistency_count: int,
                                 risk_count: int,
                                 missing_clause_count: int) -> float:
        """Calculate confidence score for contract analysis."""
        base_score = 1.0
        
        # Deduct for each issue found
        deductions = {
            "inconsistency": 0.1,
            "risk": 0.05,
            "missing_clause": 0.03
        }
        
        total_deduction = (
            inconsistency_count * deductions["inconsistency"] +
            risk_count * deductions["risk"] +
            missing_clause_count * deductions["missing_clause"]
        )
        
        return max(0.0, min(1.0, base_score - total_deduction))

    def get_template_variables(self, template_type: ContractType) -> Dict[str, str]:
        """Get required variables for a specific template."""
        template = self.templates[template_type.value.lower().replace(" ", "_")]
        return template.variables

    def list_available_templates(self) -> List[Dict[str, Any]]:
        """List all available contract templates."""
        return [
            {
                "type": template.type.value,
                "name": template.name,
                "description": template.description,
                "required_variables": list(template.variables.keys())
            }
            for template in self.templates.values()
        ] 