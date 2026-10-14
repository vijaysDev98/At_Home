export interface LegalDocSection {
  title: string;
  badge?: string;
  paragraphs?: string[];
  bulletPoints?: string[];
  closingParagraphs?: string[];
  subsections?: {
    title: string;
    paragraphs?: string[];
    bulletPoints?: string[];
  }[];
}

export interface LegalDocument {
  id: 'terms_and_conditions' | 'neutrality_charter';
  titleKey: string;
  title: string;
  subtitle: string;
  version?: string;
  date?: string;
  publisher?: string;
  governingLaw?: string;
  sections: LegalDocSection[];
}

export type LegalDocType = 'terms_and_conditions' | 'neutrality_charter';

/* -------------------------------------------------------------------------- */
/*                                ENGLISH DOCS                                */
/* -------------------------------------------------------------------------- */

export const TERMS_AND_CONDITIONS_EN: LegalDocument = {
  id: 'terms_and_conditions',
  titleKey: 'termsAndConditionsOfUse',
  title: 'TERMS AND CONDITIONS OF USE',
  subtitle:
    'Free Platform for Coordination and Connecting Home-Care Providers',
  version: '1.0 — Consolidated Draft',
  date: '13 October 2026',
  publisher: 'ECLST116',
  governingLaw: 'French law',
  sections: [
    {
      title: 'PREAMBLE',
      paragraphs: [
        'ATHOME is a digital application designed to facilitate connections between prescribing physicians and providers involved in patients’ home-care pathways.',
        'The providers concerned are primarily home healthcare providers (PSAD) and registered nurses practising independently (IDEL).',
        'ATHOME aims to simplify, coordinate, and secure exchanges in the interests of the patient.',
        'The platform operates according to the following principles:',
      ],
      bulletPoints: [
        'Respect for the patient’s freedom of choice.',
        'Professional independence of the prescribing physician.',
        'Neutrality of the platform towards providers.',
        'Free access to the service for all professional users.',
        'No remuneration linked to patient referrals or the transmission of patient information.',
        'Confidentiality of medical information.',
        'Protection of personal data.',
        'Clear distinction between the responsibilities of each party involved.',
      ],
      closingParagraphs: [
        'ATHOME is financed exclusively from the own funds of its publishing company.',
        'These General Terms and Conditions of Use, hereinafter referred to as the “Terms of Use,” define the conditions for accessing the service, its operating procedures, and the rights, obligations, and responsibilities of users.',
        'They are governed by French law.',
      ],
    },
    {
      title: 'ARTICLE 1 — PURPOSE AND SCOPE',
      paragraphs: [
        'These Terms and Conditions of Use govern the use of the ATHOME application by prescribing physicians, home healthcare providers (PSAD), and registered nurses practising independently (IDEL).',
        'ATHOME enables, in particular:',
      ],
      bulletPoints: [
        '1. Identification of home healthcare providers.',
        '2. Recording of the patient’s verbally expressed choice.',
        '3. Connecting the patient with the designated provider.',
        '4. Secure transmission of prescriptions and information necessary for patient care.',
        '5. Administrative tracking of requests for care.',
        '6. Traceability of operations carried out on the platform.',
      ],
      closingParagraphs: [
        'ATHOME does not perform any medical acts, issue any prescriptions, or provide any healthcare services.',
        'These Terms and Conditions of Use do not directly govern the care and services provided by healthcare professionals, who remain subject to their own legal and professional obligations.',
      ],
    },
    {
      title: 'ARTICLE 2 — DEFINITIONS',
      paragraphs: [
        'ATHOME: A digital solution for connecting and coordinating services, published by [legal company name].',
        'Patient: A person who is receiving or may receive home healthcare services.',
        'Prescribing Physician: A physician authorised to issue medical prescriptions as part of their professional practice.',
        'PSAD (Home Healthcare Provider): A provider that, within the limits of its qualifications and authorisations, supplies medical devices, installs and maintains them, or provides related services.',
        'IDEL (Registered Nurse Practising Independently): A state-registered nurse who is legally authorised to practise independently.',
        'Verbal Choice: The patient’s verbal expression of their preference for an identified provider.',
        'Recording: The entry made by the physician in ATHOME to record the identity of the provider verbally designated by the patient.',
        'Connection: The technical transmission of a request to the designated provider, in compliance with applicable rules.',
        'Medical Documents: Prescriptions, medical reports, and other documents containing information relating to the patient’s health.',
      ],
    },
    {
      title: 'ARTICLE 3 — THE PATIENT’S FREEDOM OF CHOICE',
      subsections: [
        {
          title: '3.1. Fundamental Principle',
          paragraphs: [
            'ATHOME respects the patient’s right to freely choose their healthcare practitioner and their method of care, in accordance with Article L.1110-8 of the French Public Health Code.',
            'The patient remains free to choose a home healthcare provider (PSAD) or a registered nurse practising independently (IDEL), subject to the applicable legal and practical requirements for the service concerned.',
          ],
        },
        {
          title: '3.2. Verbal Expression of Choice',
          paragraphs: [
            'The patient verbally communicates their choice to the prescribing physician.',
            'The physician records the identity of the designated provider in ATHOME.',
            'This recording does not constitute a decision by the physician regarding the choice of provider.',
            'The physician acts solely as the person recording the choice expressed by the patient and does not, by performing this operation alone, become a commercial referrer or representative of the provider.',
          ],
        },
        {
          title: '3.3. No Coercion',
          paragraphs: [
            'The patient may choose a provider who is listed or not listed on ATHOME.',
            'The patient must not be required to choose a particular provider because the platform is being used.',
            'The fact that the chosen provider is not listed must not prevent the patient from exercising their freedom of choice, even if transmitting the request through ATHOME requires an alternative channel or the provider to be registered on the platform first.',
          ],
        },
        {
          title: '3.4. Informing the Patient',
          paragraphs: [
            'The physician informs the patient that they remain free to choose their provider and that using ATHOME is not a condition for receiving care.',
          ],
        },
        {
          title: '3.5. Changing the Choice',
          paragraphs: [
            'The patient may change their choice, subject to the applicable legal, medical, and organisational requirements.',
            'Any change recorded in ATHOME must be traceable.',
          ],
        },
      ],
    },
    {
      title:
        'ARTICLE 4 — ROLE AND RESPONSIBILITY OF THE PRESCRIBING PHYSICIAN',
      subsections: [
        {
          title: '4.1. Medical Independence',
          paragraphs: [
            'The physician retains full professional independence.',
            'The physician remains responsible for prescriptions and medical decisions that fall within their professional competence.',
          ],
        },
        {
          title: '4.2. Recording the Patient’s Choice',
          paragraphs: [
            'When the patient has verbally expressed their choice, the physician may record the details of that choice in ATHOME.',
            'This operation is separate from the act of prescribing.',
            'Entering the provider’s details does not constitute a personalised medical recommendation or certification of the provider’s quality.',
          ],
        },
        {
          title: '4.3. No Automatic Liability',
          paragraphs: [
            'The physician cannot be held responsible for the performance of services provided by the PSAD or IDEL solely because they recorded the patient’s choice.',
            'On this basis alone, the physician does not assume the provider’s contractual, technical, or professional obligations.',
          ],
        },
        {
          title: '4.4. Limits of Protection',
          paragraphs: [
            'This clause does not exempt the physician from liability for their own errors or omissions, including an inappropriate prescription, failure to provide information, an error in recording the patient’s choice, or failure to fulfil their duties of vigilance and continuity of care.',
          ],
        },
        {
          title: '4.5. Absence of a Commercial Relationship',
          paragraphs: [
            'Recording the patient’s choice does not constitute brokerage, solicitation, or business referral.',
            'The physician receives no remuneration from ATHOME linked to the use of the platform, the choice of a provider, or the referral of a patient.',
          ],
        },
      ],
    },
    {
      title: 'ARTICLE 5 — ATTESTATION OF THE PATIENT’S VERBAL CHOICE',
      subsections: [
        {
          title: '5.1. Declaration',
          paragraphs: [
            'Before transmitting the request, the physician validates an attestation relating to the patient’s choice.',
            'The attestation confirms that the physician personally obtained or witnessed the verbal expression of the patient’s choice, that the provider entered corresponds to the patient’s expressed choice, and that the patient was informed of their freedom to choose.',
          ],
        },
        {
          title: '5.2. Traceability',
          paragraphs: ['ATHOME records, to the extent necessary:'],
          bulletPoints: [
            'The patient identifier.',
            'The physician’s identity.',
            'The designated provider.',
            'The date of the declaration.',
            'The timestamp of validation.',
            'The version of the attestation.',
            'Any subsequent changes.',
          ],
        },
        {
          title: '5.3. Evidentiary Value',
          paragraphs: [
            'Validation constitutes evidence of the declaration made by the physician.',
            'It is neither the patient’s signature nor irrefutable proof of the patient’s choice.',
          ],
        },
        {
          title: '5.4. Special Situations',
          paragraphs: [
            'Where the patient is a minor, is under a legal protection arrangement, or is unable to express their wishes, the legal rules applicable to their specific situation shall apply.',
            'The physician may not attest that the patient personally expressed a verbal choice if the patient did not express that choice.',
            'If these situations are supported by the platform, ATHOME must allow the source of the decision or declaration to be identified separately.',
          ],
        },
      ],
    },
    {
      title: 'ARTICLE 6 — FREE SERVICE AND FUNDING',
      paragraphs: [
        'ATHOME is free of charge for prescribing physicians, home healthcare providers (PSAD), and registered nurses practising independently (IDEL).',
        'No registration fees, subscription fees, commissions, per-case remuneration, or payments based on the number of patients referred are required.',
        'ATHOME is financed from the own funds of its publishing company.',
        'No financial compensation linked to patient referrals is paid to physicians or providers.',
        'The fact that ATHOME is free of charge does not mean that the healthcare services or other services provided by professionals are free.',
        'Any change to the business model will be communicated in advance and reviewed to ensure compliance with applicable rules.',
      ],
    },
    {
      title:
        'ARTICLE 7 — NEUTRALITY AND PROHIBITION OF IMPROPER REFERRAL ARRANGEMENTS',
      paragraphs: [
        'ATHOME undertakes not to establish preferential referral mechanisms based on commercial compensation.',
        'Providers are listed and presented according to objective, transparent criteria that are consistent with legal obligations.',
        'No commission for referring patients is paid or received.',
        'No provider is granted exclusive access to patient requests.',
        'ATHOME prohibits any practice involving improper referral arrangements or the granting of prohibited benefits.',
        'The fact that the service is free does not exempt the parties from complying with rules relating to benefits, professional independence, and conflicts of interest.',
      ],
    },
    {
      title: 'ARTICLE 8 — LISTING OF PROVIDERS',
      paragraphs: [
        'Home healthcare providers (PSAD) and registered nurses practising independently (IDEL) must provide the information necessary to verify their professional identity and legal eligibility to practise.',
        'ATHOME may request appropriate supporting documents, particularly those relating to professional registration, authorisations, qualifications, and mandatory insurance.',
        'Being listed on the platform does not constitute a general guarantee against future errors or failures.',
        'ATHOME may suspend a provider’s listing in the event of a serious breach, manifestly inaccurate information, or a risk to patients, in accordance with applicable rules.',
      ],
    },
    {
      title: 'ARTICLE 9 — OBLIGATIONS OF PSADs',
      paragraphs: [
        'PSADs are responsible for the services they provide in the course of their activities.',
        'In particular, they must ensure that medical devices comply with applicable requirements, interventions are safe, maintenance obligations are fulfilled, personnel are appropriately qualified, and applicable prescriptions are followed.',
        'They are responsible for their personnel, equipment, and the fulfilment of their commitments.',
        'They must maintain the confidentiality of the information they receive.',
        'They must report, in accordance with applicable procedures, any incidents that may affect patient safety.',
      ],
    },
    {
      title: 'ARTICLE 10 — OBLIGATIONS OF IDELs',
      paragraphs: [
        'IDELs retain their professional independence.',
        'They remain responsible for the nursing acts they perform, their organisation, their professional and ethical obligations, and the continuity of care for which they are responsible.',
        'They must use the data they receive exclusively for authorised purposes.',
        'Being listed on the platform does not create a relationship of subordination with ATHOME.',
      ],
    },
    {
      title: 'ARTICLE 11 — ROLE AND RESPONSIBILITY OF ATHOME',
      subsections: [
        {
          title: '11.1. Technical Role',
          paragraphs: [
            'ATHOME provides a digital infrastructure that enables the recording of the patient’s choice, the connection of relevant parties, and authorised exchanges.',
          ],
        },
        {
          title: '11.2. No Medical Intervention',
          paragraphs: [
            'ATHOME does not make any therapeutic decisions and does not replace healthcare professionals in the exercise of their professional responsibilities.',
          ],
        },
        {
          title: '11.3. Independent Service Providers',
          paragraphs: [
            'PSADs and IDELs operate under their own professional responsibility.',
            'ATHOME shall not be held liable solely on the grounds of a fault or failure to perform that is exclusively attributable to an independent service provider.',
          ],
        },
        {
          title: '11.4. ATHOME’s Own Responsibilities',
          paragraphs: [
            'ATHOME remains responsible for its own legal and contractual obligations, particularly with regard to system security, confidentiality, data protection, and the operation of the services as described.',
            'No provision of these Terms of Use shall limit any liability that cannot legally be excluded or restricted.',
          ],
        },
      ],
    },
    {
      title: 'ARTICLE 12 — MEDICAL CONFIDENTIALITY AND PRIVACY',
      paragraphs: [
        'Information relating to the patient’s health is protected by professional secrecy under the conditions set out in Article L.1110-4 of the French Public Health Code.',
        'Exchanges are restricted to identified professionals who are effectively involved in the patient’s care and to information that is strictly necessary for the performance of their duties.',
        'Information sharing between members of the same care team is subject to the specific legal conditions applicable to such situations.',
        'Information sharing between professionals who do not belong to the same care team requires the patient’s prior consent, in accordance with the applicable legal requirements.',
        'The patient is informed of their rights, including the right to object under the conditions provided by law.',
        'The oral designation of a service provider does not, by itself, constitute general consent to share the medical record.',
      ],
    },
    {
      title: 'ARTICLE 13 — TRANSMISSION OF MEDICAL DOCUMENTS',
      paragraphs: [
        'ATHOME may enable the transmission of prescriptions, care coordination documents, reports, and information necessary for patient care.',
        'Each transmission must comply with the principles of necessity, relevance, and proportionality.',
        'Documents may only be accessed by authorised users.',
        'Service providers may not access documents relating to patients unless they have a legitimate reason and the appropriate authorisation to do so.',
        'Transmissions must be logged in accordance with the applicable security and traceability requirements.',
        'ATHOME does not guarantee the medical validity of a document merely because it has been transmitted through the platform.',
      ],
    },
    {
      title: 'ARTICLE 14 — PERSONAL DATA PROTECTION',
      paragraphs: [
        'Data processing carried out through ATHOME is subject to the General Data Protection Regulation (GDPR) and the French Data Protection Act (Loi Informatique et Libertés).',
        'Data is processed for specific purposes, including:',
      ],
      bulletPoints: [
        'Account and access-permission management.',
        'Connecting the professionals involved in patient care.',
        'Transmitting information necessary for healthcare.',
        'Maintaining traceability of choices and operations.',
        'System security.',
        'Incident management and compliance with legal obligations.',
      ],
      closingParagraphs: [
        'Each processing activity must have an appropriate legal basis under Article 6 of the GDPR and, where health data is involved, must satisfy an applicable condition under Article 9.',
        'ATHOME’s classification as a data controller, joint controller, or data processor depends on its actual role in each processing activity.',
        'Data-processing relationships are subject to the agreements required under Article 28 of the GDPR.',
        'Data subjects are entitled to the rights provided for under applicable regulations, subject to the conditions governing their exercise.',
        'Detailed information is provided in ATHOME’s Privacy Policy.',
      ],
    },
    {
      title: 'ARTICLE 15 — HOSTING AND SECURITY',
      paragraphs: [
        'ATHOME implements technical and organisational measures appropriate to the sensitivity of the information processed.',
        'Depending on the risks and applicable requirements, these measures include, in particular:',
      ],
      bulletPoints: [
        'Authentication of healthcare professionals.',
        'Individualised management of access permissions.',
        'Protection of communications and stored data.',
        'Logging of access.',
        'Data backup and restoration.',
        'Monitoring and management of security incidents.',
        'Revocation of access rights that are no longer justified.',
      ],
      closingParagraphs: [
        'Where hosting activities fall within the scope of Article L.1111-8 of the French Public Health Code, the data is hosted under a certified HDS (Hébergeur de Données de Santé) service covering the relevant activities.',
        'Hosting arrangements, technical subcontractors, and any international data transfers are documented in the privacy information.',
      ],
    },
    {
      title: 'ARTICLE 16 — DATA RETENTION',
      paragraphs: [
        'ATHOME retains data for as long as necessary to fulfil the intended purposes and comply with legal obligations.',
        'Retention periods are defined according to the categories of data, including user accounts, attestations, security logs, connection requests, and medical documents.',
        'The specific retention periods, their starting points, and the procedures for deletion or archiving are documented in a data retention policy.',
        'ATHOME does not automatically assume responsibility for the medical record retention obligations applicable to healthcare professionals.',
      ],
    },
    {
      title: 'ARTICLE 17 — RIGHTS OF DATA SUBJECTS',
      paragraphs: [
        'Patients and healthcare professionals may exercise the rights provided under the GDPR by contacting the organisation responsible for the processing activity concerned.',
        'Subject to the conditions established by applicable regulations, these rights include the right of access, rectification, erasure, restriction of processing, objection, and data portability.',
        'They also have the right to lodge a complaint with the CNIL (French Data Protection Authority).',
        'Contact details and procedures for exercising these rights are provided in the Privacy Policy.',
      ],
    },
    {
      title: 'ARTICLE 18 — SECURITY INCIDENTS',
      paragraphs: [
        'Users must report any security incidents or unauthorised disclosures of which they become aware without undue delay.',
        'ATHOME implements procedures for detecting, investigating, containing, and remedying such incidents.',
        'Data breaches are documented and, where the applicable regulatory conditions are met, reported to the CNIL and communicated to the affected individuals.',
        'Where ATHOME acts as a data processor, it informs the data controller in accordance with its contractual and regulatory obligations.',
      ],
    },
    {
      title: 'ARTICLE 19 — CONTINUITY OF CARE AND SERVICE AVAILABILITY',
      paragraphs: [
        'ATHOME is not a medical emergency service.',
        'In the event of service unavailability, healthcare professionals must use appropriate alternative means to preserve continuity of care.',
        'ATHOME implements the technical and organisational measures planned to ensure the availability and restoration of its services.',
        'Maintenance or security-related interruptions are managed in accordance with the arrangements communicated to users.',
      ],
    },
    {
      title: 'ARTICLE 20 — ACCOUNT ACCESS',
      paragraphs: [
        'Access to ATHOME is restricted to authorised users.',
        'Each healthcare professional is responsible for the use of their authentication credentials and undertakes not to share their login details.',
        'Access rights are personal and tailored to the duties performed.',
        'ATHOME may suspend access in the event of a serious security risk, fraud, or a breach of these Terms of Use.',
      ],
    },
    {
      title: 'ARTICLE 21 — NON-EXCLUSIVITY',
      paragraphs: [
        'Use of ATHOME is optional.',
        'No physician, PSAD, or IDEL is required to use the platform exclusively.',
        'The patient retains their freedom of choice, including when they designate a service provider who is not listed on the platform.',
        'These Terms of Use do not impose any commercial or territorial exclusivity.',
      ],
    },
    {
      title: 'ARTICLE 22 — INTELLECTUAL PROPERTY',
      paragraphs: [
        'The application, its software, interfaces, graphic elements, and original content remain protected by the applicable intellectual property rights.',
        'Users are granted a personal, non-exclusive, and non-transferable right to use the service in accordance with these Terms of Use.',
        'Medical documents uploaded to the platform do not become the property of ATHOME.',
      ],
    },
    {
      title: 'ARTICLE 23 — AMENDMENTS TO THE TERMS OF USE',
      paragraphs: [
        'ATHOME may amend these Terms of Use to reflect legal, regulatory, technical, or functional developments.',
        'Users will be informed of amendments through appropriate means.',
        'Where amendments require renewed acceptance, such acceptance must be obtained before the relevant use of the service continues.',
      ],
    },
    {
      title: 'ARTICLE 24 — SUSPENSION AND TERMINATION OF USE',
      paragraphs: [
        'A user may request closure of their account in accordance with the procedures established by ATHOME.',
        'Account closure does not release the parties from their data retention or confidentiality obligations.',
        'ATHOME may suspend or terminate access in the event of a serious breach, fraud, or a security risk, provided that the measures taken are proportionate.',
        'The procedures for ending use of the service must preserve access, where necessary, to information essential for continuity of care.',
      ],
    },
    {
      title: 'ARTICLE 25 — APPLICABLE LAW AND DISPUTES',
      paragraphs: [
        'These Terms of Use are governed by French law.',
        'In the event of a dispute, the parties may seek an amicable resolution, without prejudice to their legal rights and remedies.',
        'The competent courts shall be determined in accordance with the applicable rules of ordinary law.',
      ],
    },
    {
      title: 'ARTICLE 26 — IDENTIFICATION OF THE PUBLISHER',
      paragraphs: [
        'Application Name: ATHOME',
        'Publishing Company: ECLST116',
        'Legal Form: LLC',
        'Registered Office:\n7901 4TH ST N STE 300\nST PETERSBURG, FL 33702',
      ],
    },
    {
      title: 'FINAL PROVISION',
      paragraphs: [
        'ATHOME aims to facilitate the coordination of home healthcare in the patient’s best interests.',
        'The patient remains free to choose their service provider.',
        'The physician retains their medical independence and, within the provider designation process, is limited to recording the oral choice expressed by the patient.',
        'PSADs and IDELs remain responsible for their respective services.',
        'ATHOME fulfils its technical role by facilitating connections and secure transmission, within the limits of its commitments and legal obligations.',
        'The free-of-charge nature of the service and its funding through the publisher’s own funds help preserve the independence of the system, without exempting the parties involved from complying with applicable professional and regulatory requirements.',
      ],
    },
  ],
};

export const NEUTRALITY_CHARTER_EN: LegalDocument = {
  id: 'neutrality_charter',
  titleKey: 'neutralityCharter',
  title: 'ATHOME — NEUTRALITY AND INDEPENDENCE CHARTER',
  subtitle: '',
  sections: [
    {
      title: '',
      paragraphs: ['The company publishing ATHOME undertakes to:'],
      bulletPoints: [
        '1. Guarantee that the platform is free of charge for prescribing physicians, PSADs, and IDELs.',
        '2. Finance its operations through its own funds, in accordance with the declared business model.',
        '3. Receive no commissions related to patient referrals or the transmission of patient information.',
        '4. Pay no remuneration to physicians in exchange for facilitating connections.',
        '5. Give no preferential treatment to any service provider on the basis of a financial or commercial advantage.',
        '6. Respect patients’ freedom of choice.',
        '7. Guarantee the professional independence of physicians and service providers.',
        '8. Not sell patients’ medical data.',
        '9. Ensure the confidentiality and security of the information processed.',
        '10. Prevent and address conflicts of interest that could compromise the neutrality of the service.',
      ],
    },
    {
      title: '',
      paragraphs: [
        'This Charter supplements the Terms and Conditions of Use (CGU) without replacing the applicable legal and regulatory obligations.',
      ],
    },
  ],
};

/* -------------------------------------------------------------------------- */
/*                                FRENCH DOCS                                 */
/* -------------------------------------------------------------------------- */

export const TERMS_AND_CONDITIONS_FR: LegalDocument = {
  id: 'terms_and_conditions',
  titleKey: 'termsAndConditionsOfUse',
  title: 'CONDITIONS GÉNÉRALES D’UTILISATION',
  subtitle:
    'Plateforme gratuite de coordination et de mise en relation pour les soins à domicile',
  version: '1.0 — Projet consolidé',
  date: '13 octobre 2026',
  publisher: 'ECLST116',
  governingLaw: 'Droit français',
  sections: [
    {
      title: 'PRÉAMBULE',
      paragraphs: [
        'ATHOME est une application numérique destinée à faciliter la mise en relation entre les médecins prescripteurs et les prestataires intervenant dans le parcours de soins à domicile des patients.',
        'Les prestataires concernés sont principalement les prestataires de santé à domicile (PSAD) et les infirmiers diplômés d’État libéraux (IDEL).',
        'ATHOME poursuit un objectif de simplification, de coordination et de sécurisation des échanges, dans l’intérêt du patient.',
        'Le fonctionnement de la plateforme repose sur les principes suivants :',
      ],
      bulletPoints: [
        'Le respect du libre choix du patient.',
        'L’indépendance professionnelle du médecin prescripteur.',
        'La neutralité de la plateforme à l’égard des prestataires.',
        'La gratuité du service pour l’ensemble des professionnels utilisateurs.',
        'L’absence de rémunération liée à l’orientation ou à la transmission de patients.',
        'La confidentialité des informations médicales.',
        'La protection des données personnelles.',
        'La distinction des responsabilités de chaque intervenant.',
      ],
      closingParagraphs: [
        'ATHOME est financée exclusivement par les fonds propres de sa société éditrice.',
        'Les présentes Conditions Générales d’Utilisation, ci-après « CGU », définissent les conditions d’accès au service, ses modalités de fonctionnement ainsi que les droits, obligations et responsabilités des utilisateurs.',
        'Elles sont régies par le droit français.',
      ],
    },
    {
      title: 'ARTICLE 1 — OBJET ET CHAMP D’APPLICATION',
      paragraphs: [
        'Les présentes CGU encadrent l’utilisation de l’application ATHOME par les médecins prescripteurs, les PSAD et les IDEL.',
        'ATHOME permet notamment :',
      ],
      bulletPoints: [
        '1. L’identification des prestataires de santé à domicile.',
        '2. La retranscription du choix oral du patient.',
        '3. La mise en relation avec le prestataire désigné.',
        '4. La transmission sécurisée des prescriptions et informations nécessaires à la prise en charge.',
        '5. Le suivi administratif des demandes de prise en charge.',
        '6. La traçabilité des opérations effectuées sur la plateforme.',
      ],
      closingParagraphs: [
        'ATHOME ne réalise aucun acte médical, ne délivre aucune prescription et n’exécute aucune prestation de santé.',
        'Les présentes CGU ne régissent pas directement les soins et prestations réalisés par les professionnels, lesquels demeurent soumis à leurs propres obligations légales et professionnelles.',
      ],
    },
    {
      title: 'ARTICLE 2 — DÉFINITIONS',
      paragraphs: [
        'ATHOME : solution numérique de mise en relation et de coordination éditée par [raison sociale].',
        'Patient : personne bénéficiant ou susceptible de bénéficier d’une prestation de santé à domicile.',
        'Médecin prescripteur : médecin habilité à établir une prescription médicale dans le cadre de son exercice professionnel.',
        'PSAD : prestataire de santé à domicile intervenant, dans les limites de ses qualifications et habilitations, pour la fourniture de dispositifs médicaux, leur installation, leur maintenance ou les prestations associées.',
        'IDEL : infirmier diplômé d’État exerçant légalement à titre libéral.',
        'Choix oral : expression verbale par le patient de sa préférence pour un prestataire identifié.',
        'Retranscription : enregistrement dans ATHOME par le médecin de l’identité du prestataire désigné oralement.',
        'Mise en relation : transmission technique d’une demande au prestataire désigné, dans le respect des règles applicables.',
        'Documents médicaux : prescriptions, comptes rendus et autres documents contenant des informations relatives à la santé du patient.',
      ],
    },
    {
      title: 'ARTICLE 3 — LIBRE CHOIX DU PATIENT',
      subsections: [
        {
          title: '3.1. Principe fondamental',
          paragraphs: [
            'ATHOME respecte le droit du patient au libre choix de son praticien et de son mode de prise en charge, conformément à l’article L.1110-8 du Code de la santé publique.',
            'Le patient conserve la liberté de choisir un PSAD ou un IDEL, dans les limites légales et pratiques applicables à la prestation envisagée.',
          ],
        },
        {
          title: '3.2. Expression orale du choix',
          paragraphs: [
            'Le patient exprime oralement son choix auprès du médecin prescripteur.',
            'Le médecin retranscrit dans ATHOME l’identité du prestataire désigné.',
            'Cette retranscription ne constitue pas une décision du médecin relative au choix du prestataire.',
            'Le médecin intervient comme déclarant du choix exprimé, sans devenir, du seul fait de cette opération, le prescripteur commercial ou le représentant du prestataire.',
          ],
        },
        {
          title: '3.3. Absence de contrainte',
          paragraphs: [
            'Le patient peut choisir un prestataire référencé ou non sur ATHOME.',
            'Il ne peut lui être imposé de choisir un prestataire déterminé en raison de l’utilisation de la plateforme.',
            'L’absence de référencement du prestataire choisi ne doit pas empêcher le patient d’exercer sa liberté de choix, même si la transmission technique par ATHOME peut nécessiter un autre canal ou l’intégration préalable du prestataire.',
          ],
        },
        {
          title: '3.4. Information du patient',
          paragraphs: [
            'Le médecin informe le patient qu’il demeure libre de choisir son prestataire et que l’utilisation d’ATHOME ne conditionne pas sa prise en charge.',
          ],
        },
        {
          title: '3.5. Modification du choix',
          paragraphs: [
            'Le patient peut modifier son choix, sous réserve des contraintes légales, médicales et organisationnelles applicables.',
            'Toute modification enregistrée dans ATHOME doit être tracée.',
          ],
        },
      ],
    },
    {
      title:
        'ARTICLE 4 — RÔLE ET RESPONSABILITÉ DU MÉDECIN PRESCRIPTEUR',
      subsections: [
        {
          title: '4.1. Indépendance médicale',
          paragraphs: [
            'Le médecin conserve son entière indépendance professionnelle.',
            'Il demeure responsable des prescriptions et décisions médicales relevant de sa compétence.',
          ],
        },
        {
          title: '4.2. Retranscription déclarative',
          paragraphs: [
            'Lorsque le patient a exprimé oralement son choix, le médecin peut en enregistrer la teneur dans ATHOME.',
            'Cette opération est distincte de l’acte de prescription.',
            'La saisie du prestataire ne vaut pas recommandation médicale personnalisée ni certification de la qualité du prestataire.',
          ],
        },
        {
          title: '4.3. Absence de responsabilité automatique',
          paragraphs: [
            'Le médecin ne peut être considéré comme responsable de l’exécution des prestations du PSAD ou de l’IDEL du seul fait qu’il a retranscrit le choix du patient.',
            'Le médecin n’assume pas, à ce seul titre, les obligations contractuelles, techniques ou professionnelles du prestataire.',
          ],
        },
        {
          title: '4.4. Limites de protection',
          paragraphs: [
            'La présente clause ne saurait exonérer le médecin de sa responsabilité pour ses propres fautes, notamment une prescription inadaptée, un défaut d’information, une erreur de retranscription ou un manquement à ses obligations de vigilance et de continuité des soins.',
          ],
        },
        {
          title: '4.5. Absence de relation commerciale',
          paragraphs: [
            'La retranscription du choix du patient ne constitue pas un acte de courtage, de démarchage ou d’apport d’affaires.',
            'Le médecin ne perçoit aucune rémunération d’ATHOME liée à l’utilisation de la plateforme, au choix d’un prestataire ou à la transmission d’un patient.',
          ],
        },
      ],
    },
    {
      title: 'ARTICLE 5 — ATTESTATION DU CHOIX ORAL',
      subsections: [
        {
          title: '5.1. Déclaration',
          paragraphs: [
            'Avant la transmission de la demande, le médecin valide une attestation relative au choix du patient.',
            'L’attestation confirme que le médecin a personnellement recueilli ou constaté l’expression orale du choix, que le prestataire renseigné correspond à cette expression et que le patient a été informé de sa liberté de choix.',
          ],
        },
        {
          title: '5.2. Traçabilité',
          paragraphs: ['ATHOME enregistre, dans la mesure nécessaire :'],
          bulletPoints: [
            'L’identifiant du patient.',
            'L’identité du médecin.',
            'Le prestataire désigné.',
            'La date de la déclaration.',
            'L’horodatage de la validation.',
            'La version de l’attestation.',
            'Les modifications ultérieures.',
          ],
        },
        {
          title: '5.3. Portée probatoire',
          paragraphs: [
            'La validation constitue une preuve de la déclaration effectuée par le médecin.',
            'Elle ne constitue ni une signature du patient ni une preuve irréfragable de son choix.',
          ],
        },
        {
          title: '5.4. Situations particulières',
          paragraphs: [
            'Lorsque le patient est mineur, protégé ou dans l’impossibilité d’exprimer sa volonté, les règles légales propres à sa situation s’appliquent.',
            'Le médecin ne peut attester d’un choix oral personnel du patient si ce choix n’a pas été exprimé.',
            'ATHOME doit permettre, si ces situations sont prises en charge, d’identifier distinctement l’origine de la décision ou de la déclaration.',
          ],
        },
      ],
    },
    {
      title: 'ARTICLE 6 — GRATUITÉ ET FINANCEMENT',
      paragraphs: [
        'ATHOME est gratuite pour les médecins prescripteurs, les PSAD et les IDEL.',
        'Aucun frais d’inscription, abonnement, commission, rémunération par dossier ou paiement conditionné au nombre de patients transmis n’est exigé.',
        'ATHOME est financée par les fonds propres de sa société éditrice.',
        'Aucune contrepartie financière liée à l’orientation des patients n’est versée aux médecins ou aux prestataires.',
        'La gratuité d’ATHOME n’emporte pas gratuité des soins ou prestations réalisés par les professionnels.',
        'Toute modification du modèle économique fera l’objet d’une information préalable et d’une vérification de sa conformité aux règles applicables.',
      ],
    },
    {
      title: 'ARTICLE 7 — NEUTRALITÉ ET ABSENCE DE COMPÉRAGE',
      paragraphs: [
        'ATHOME s’engage à ne pas organiser de mécanisme d’orientation préférentielle reposant sur une contrepartie commerciale.',
        'Les prestataires sont référencés et présentés selon des critères objectifs, transparents et compatibles avec les obligations légales.',
        'Aucune commission d’apport de patients n’est versée ou perçue.',
        'Aucun prestataire ne bénéficie d’un droit exclusif d’accès aux demandes des patients.',
        'ATHOME s’interdit toute pratique de compérage ou d’octroi d’avantages prohibés.',
        'La gratuité ne dispense pas les parties du respect des règles relatives aux avantages, à l’indépendance professionnelle et aux conflits d’intérêts.',
      ],
    },
    {
      title: 'ARTICLE 8 — RÉFÉRENCEMENT DES PRESTATAIRES',
      paragraphs: [
        'Les PSAD et IDEL doivent fournir les informations nécessaires à la vérification de leur identité professionnelle et de leur aptitude légale à exercer.',
        'ATHOME peut demander les justificatifs appropriés, notamment concernant les inscriptions professionnelles, les autorisations, les qualifications et les assurances obligatoires.',
        'Le référencement n’emporte aucune garantie générale d’absence de faute ou de défaillance future.',
        'ATHOME peut suspendre un référencement en cas de manquement grave, d’information manifestement erronée ou de risque pour les patients, dans le respect des règles applicables.',
      ],
    },
    {
      title: 'ARTICLE 9 — OBLIGATIONS DES PSAD',
      paragraphs: [
        'Les PSAD sont responsables des prestations qu’ils réalisent dans le cadre de leur activité.',
        'Ils veillent notamment à la conformité des dispositifs médicaux, à la sécurité des interventions, aux obligations de maintenance, à la qualification des intervenants et au respect des prescriptions applicables.',
        'Ils sont responsables de leurs personnels, de leurs équipements et de l’exécution de leurs engagements.',
        'Ils assurent la confidentialité des informations reçues.',
        'Ils signalent, selon les procédures applicables, les incidents susceptibles d’affecter la sécurité du patient.',
      ],
    },
    {
      title: 'ARTICLE 10 — OBLIGATIONS DES IDEL',
      paragraphs: [
        'Les IDEL conservent leur indépendance professionnelle.',
        'Ils demeurent responsables des actes infirmiers qu’ils réalisent, de leur organisation, de leurs obligations déontologiques et de la continuité des soins relevant de leur responsabilité.',
        'Ils utilisent les données reçues exclusivement pour les finalités autorisées.',
        'Leur référencement ne crée aucun lien de subordination avec ATHOME.',
      ],
    },
    {
      title: 'ARTICLE 11 — RÔLE ET RESPONSABILITÉ D’ATHOME',
      subsections: [
        {
          title: '11.1. Rôle technique',
          paragraphs: [
            'ATHOME met à disposition une infrastructure numérique permettant la retranscription du choix du patient, la mise en relation et les échanges autorisés.',
          ],
        },
        {
          title: '11.2. Absence d’intervention médicale',
          paragraphs: [
            'ATHOME ne prend aucune décision thérapeutique et ne se substitue pas aux professionnels dans l’exercice de leurs compétences.',
          ],
        },
        {
          title: '11.3. Prestataires indépendants',
          paragraphs: [
            'Les PSAD et IDEL interviennent sous leur propre responsabilité professionnelle.',
            'ATHOME n’est pas responsable du seul fait d’une faute ou d’une inexécution exclusivement imputable à un prestataire indépendant.',
          ],
        },
        {
          title: '11.4. Responsabilité propre',
          paragraphs: [
            'ATHOME demeure responsable de ses propres obligations légales et contractuelles, notamment en matière de sécurité du système, de confidentialité, de protection des données et de fonctionnement des services annoncés.',
            'Aucune clause des présentes CGU ne saurait limiter les responsabilités auxquelles il ne peut légalement être dérogé.',
          ],
        },
      ],
    },
    {
      title: 'ARTICLE 12 — SECRET MÉDICAL ET CONFIDENTIALITÉ',
      paragraphs: [
        'Les informations relatives à la santé du patient sont couvertes par le secret professionnel dans les conditions prévues à l’article L.1110-4 du Code de la santé publique.',
        'Les échanges sont limités aux professionnels identifiés participant effectivement à la prise en charge et aux informations strictement nécessaires à leurs missions.',
        'Le partage entre membres d’une même équipe de soins obéit aux conditions légales propres à cette situation.',
        'Le partage entre professionnels ne relevant pas de la même équipe de soins requiert le consentement préalable du patient dans les conditions légales applicables.',
        'Le patient est informé de ses droits, notamment de son droit d’opposition dans les conditions prévues par la loi.',
        'La désignation orale du prestataire ne constitue pas, à elle seule, un consentement général au partage du dossier médical.',
      ],
    },
    {
      title: 'ARTICLE 13 — TRANSMISSION DES DOCUMENTS MÉDICAUX',
      paragraphs: [
        'ATHOME peut permettre la transmission de prescriptions, documents de coordination, comptes rendus et informations nécessaires à la prise en charge.',
        'Chaque transmission doit respecter les principes de nécessité, de pertinence et de proportionnalité.',
        'Les documents ne peuvent être consultés que par les utilisateurs habilités.',
        'Les prestataires ne peuvent accéder aux documents des patients pour lesquels ils ne disposent pas d’un motif légitime et d’une habilitation appropriée.',
        'Les transmissions doivent être journalisées selon les exigences de sécurité et de traçabilité applicables.',
        'ATHOME ne garantit pas la validité médicale d’un document simplement parce qu’il est transmis par la plateforme.',
      ],
    },
    {
      title: 'ARTICLE 14 — PROTECTION DES DONNÉES PERSONNELLES',
      paragraphs: [
        'Les traitements de données réalisés dans ATHOME sont soumis au RGPD et à la loi Informatique et Libertés.',
        'Les données sont traitées pour des finalités déterminées, notamment :',
      ],
      bulletPoints: [
        'La gestion des comptes et des habilitations.',
        'La mise en relation des intervenants.',
        'La transmission des informations nécessaires aux soins.',
        'La traçabilité des choix et opérations.',
        'La sécurité du système.',
        'La gestion des incidents et obligations légales.',
      ],
      closingParagraphs: [
        'Chaque traitement doit reposer sur une base juridique appropriée au sens de l’article 6 du RGPD et, lorsqu’il concerne des données de santé, sur une condition applicable de l’article 9.',
        'La qualification d’ATHOME comme responsable de traitement, responsable conjoint ou sous-traitant dépend de son rôle réel dans chaque opération.',
        'Les relations de sous-traitance font l’objet des accords requis par l’article 28 du RGPD.',
        'Les personnes concernées bénéficient des droits prévus par la réglementation, selon leurs conditions d’application.',
        'Les modalités détaillées figurent dans la politique de confidentialité d’ATHOME.',
      ],
    },
    {
      title: 'ARTICLE 15 — HÉBERGEMENT ET SÉCURITÉ',
      paragraphs: [
        'ATHOME met en œuvre des mesures techniques et organisationnelles adaptées à la sensibilité des informations traitées.',
        'Ces mesures comprennent notamment, selon les risques et les exigences applicables :',
      ],
      bulletPoints: [
        'L’authentification des professionnels.',
        'La gestion individualisée des habilitations.',
        'La protection des communications et des données stockées.',
        'La journalisation des accès.',
        'La sauvegarde et la restauration des informations.',
        'La surveillance et la gestion des incidents de sécurité.',
        'La révocation des accès devenus injustifiés.',
      ],
      closingParagraphs: [
        'Lorsque l’activité d’hébergement entre dans le champ de l’article L.1111-8 du Code de la santé publique, les données sont hébergées dans le cadre d’une prestation certifiée HDS couvrant les activités concernées.',
        'L’hébergement, les sous-traitants techniques et les éventuels transferts internationaux sont documentés dans les informations de confidentialité.',
      ],
    },
    {
      title: 'ARTICLE 16 — CONSERVATION DES DONNÉES',
      paragraphs: [
        'ATHOME conserve les données pendant les durées nécessaires aux finalités poursuivies et au respect des obligations légales.',
        'Les durées sont définies selon les catégories de données : comptes utilisateurs, attestations, journaux de sécurité, demandes de mise en relation et documents médicaux.',
        'Les durées précises, leurs points de départ et les modalités de suppression ou d’archivage sont documentés dans une politique de conservation.',
        'ATHOME ne se substitue pas automatiquement aux obligations de conservation des dossiers médicaux propres aux professionnels.',
      ],
    },
    {
      title: 'ARTICLE 17 — DROITS DES PERSONNES CONCERNÉES',
      paragraphs: [
        'Les patients et professionnels peuvent exercer les droits prévus par le RGPD auprès de l’organisme compétent pour le traitement concerné.',
        'Ces droits comprennent, dans les conditions prévues par la réglementation, l’accès, la rectification, l’effacement, la limitation, l’opposition et la portabilité.',
        'Ils disposent également du droit d’introduire une réclamation auprès de la CNIL.',
        'Les coordonnées et modalités d’exercice des droits figurent dans la politique de confidentialité.',
      ],
    },
    {
      title: 'ARTICLE 18 — INCIDENTS DE SÉCURITÉ',
      paragraphs: [
        'Les utilisateurs signalent sans délai indu les incidents de sécurité ou divulgations non autorisées dont ils ont connaissance.',
        'ATHOME met en œuvre des procédures de détection, d’investigation, de confinement et de remédiation.',
        'Les violations de données sont documentées et, lorsque les conditions réglementaires sont réunies, notifiées à la CNIL et communiquées aux personnes concernées.',
        'Lorsque ATHOME agit en qualité de sous-traitant, elle informe le responsable de traitement conformément à ses obligations contractuelles et réglementaires.',
      ],
    },
    {
      title: 'ARTICLE 19 — CONTINUITÉ DES SOINS ET DISPONIBILITÉ',
      paragraphs: [
        'ATHOME ne constitue pas un service d’urgence médicale.',
        'En cas d’indisponibilité, les professionnels utilisent les moyens alternatifs appropriés afin de préserver la continuité des soins.',
        'ATHOME met en œuvre les moyens techniques et organisationnels prévus pour assurer la disponibilité et la restauration de ses services.',
        'Les interruptions de maintenance ou de sécurité sont gérées selon les modalités communiquées aux utilisateurs.',
      ],
    },
    {
      title: 'ARTICLE 20 — ACCÈS AUX COMPTES',
      paragraphs: [
        'L’accès à ATHOME est réservé aux utilisateurs autorisés.',
        'Chaque professionnel est responsable de l’usage de ses moyens d’authentification et s’engage à ne pas communiquer ses identifiants.',
        'Les accès sont personnels et adaptés aux missions exercées.',
        'ATHOME peut suspendre un accès en cas de risque grave pour la sécurité, de fraude ou de manquement aux présentes CGU.',
      ],
    },
    {
      title: 'ARTICLE 21 — ABSENCE D’EXCLUSIVITÉ',
      paragraphs: [
        'L’utilisation d’ATHOME est facultative.',
        'Aucun médecin, PSAD ou IDEL n’est tenu de recourir exclusivement à la plateforme.',
        'Le patient conserve sa liberté de choix, y compris lorsqu’il désigne un prestataire non référencé.',
        'ATHOME n’impose aucune exclusivité commerciale ou territoriale au titre des présentes CGU.',
      ],
    },
    {
      title: 'ARTICLE 22 — PROPRIÉTÉ INTELLECTUELLE',
      paragraphs: [
        'L’application, ses logiciels, interfaces, éléments graphiques et contenus propres demeurent protégés par les droits de propriété intellectuelle applicables.',
        'L’utilisateur bénéficie d’un droit personnel, non exclusif et non transférable d’utilisation du service conformément aux présentes CGU.',
        'Les documents médicaux déposés sur la plateforme ne deviennent pas la propriété d’ATHOME.',
      ],
    },
    {
      title: 'ARTICLE 23 — MODIFICATION DES CGU',
      paragraphs: [
        'ATHOME peut modifier les présentes CGU pour tenir compte des évolutions légales, réglementaires, techniques ou fonctionnelles.',
        'Les utilisateurs sont informés des modifications dans des conditions appropriées.',
        'Lorsque les modifications nécessitent une nouvelle acceptation, celle-ci est recueillie avant la poursuite de l’utilisation concernée.',
      ],
    },
    {
      title: 'ARTICLE 24 — SUSPENSION ET FIN D’UTILISATION',
      paragraphs: [
        'Un utilisateur peut demander la clôture de son compte selon les modalités prévues par ATHOME.',
        'La clôture ne dispense pas les parties du respect de leurs obligations de conservation ou de confidentialité.',
        'ATHOME peut suspendre ou résilier un accès en cas de manquement grave, de fraude ou de risque pour la sécurité, dans des conditions proportionnées.',
        'Les modalités de fin d’utilisation doivent préserver, lorsque cela est nécessaire, l’accès aux informations indispensables à la continuité des soins.',
      ],
    },
    {
      title: 'ARTICLE 25 — DROIT APPLICABLE ET DIFFÉRENDS',
      paragraphs: [
        'Les présentes CGU sont régies par le droit français.',
        'En cas de différend, les parties peuvent rechercher une solution amiable, sans préjudice de leurs droits et recours légaux.',
        'Les juridictions compétentes sont déterminées conformément aux règles de droit commun applicables.',
      ],
    },
    {
      title: 'ARTICLE 26 — IDENTIFICATION DE L’ÉDITEUR',
      paragraphs: [
        'Nom de l’application : ATHOME',
        'Société éditrice : ECLST116',
        'Forme juridique : LLC',
        'Siège social : 7901 4TH ST N STE 300\nST PETERSBURG FL 33702',
      ],
    },
    {
      title: 'DISPOSITION FINALE',
      paragraphs: [
        'ATHOME a pour finalité de faciliter la coordination des soins à domicile, dans l’intérêt du patient.',
        'Le patient demeure libre du choix de son prestataire.',
        'Le médecin conserve son indépendance médicale et se limite, dans le processus de désignation du prestataire, à retranscrire le choix oral exprimé par le patient.',
        'Les PSAD et IDEL demeurent responsables de leurs prestations respectives.',
        'ATHOME assure son rôle technique de mise en relation et de transmission sécurisée, dans les limites de ses engagements et obligations légales.',
        'La gratuité et le financement par les fonds propres de l’éditeur contribuent à préserver l’indépendance du dispositif, sans dispenser les intervenants du respect des règles professionnelles et réglementaires applicables.',
      ],
    },
  ],
};

export const NEUTRALITY_CHARTER_FR: LegalDocument = {
  id: 'neutrality_charter',
  titleKey: 'neutralityCharter',
  title: "CHARTE DE NEUTRALITÉ ET D'INDÉPENDANCE ATHOME",
  subtitle: '',
  sections: [
    {
      title: '',
      paragraphs: ["La société éditrice d'ATHOME s'engage à :"],
      bulletPoints: [
        '1. Garantir la gratuité de la plateforme pour les médecins prescripteurs, PSAD et IDEL.',
        '2. Financer son fonctionnement par ses fonds propres, conformément au modèle déclaré.',
        "3. Ne percevoir aucune commission liée à l'orientation ou à la transmission de patients.",
        '4. Ne verser aucune rémunération aux médecins en contrepartie des mises en relation.',
        "5. Ne favoriser aucun prestataire sur la base d'un avantage financier ou commercial.",
        '6. Respecter la liberté de choix des patients.',
        "7. Garantir l'indépendance professionnelle des médecins et des prestataires.",
        '8. Ne pas vendre les données médicales des patients.',
        '9. Assurer la confidentialité et la sécurité des informations traitées.',
        "10. Prévenir et traiter les conflits d'intérêts susceptibles de compromettre la neutralité du service.",
      ],
    },
    {
      title: '',
      paragraphs: [
        'La présente charte complète les CGU sans se substituer aux obligations légales et réglementaires applicables.',
      ],
    },
  ],
};

export const getLegalDocument = (
  id: LegalDocType,
  language?: string,
): LegalDocument => {
  const isFrench = language?.startsWith('fr');

  if (id === 'neutrality_charter') {
    return isFrench ? NEUTRALITY_CHARTER_FR : NEUTRALITY_CHARTER_EN;
  }

  return isFrench ? TERMS_AND_CONDITIONS_FR : TERMS_AND_CONDITIONS_EN;
};
