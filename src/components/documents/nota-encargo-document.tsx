"use client";

import React, { useState, useEffect } from 'react';
import { getBrandAsset } from "~/app/actions/brand-upload";
import { getCurrentUserAccountIdAction } from "~/app/actions/settings";
import { getAgentNameAction, getOfficeInfoAction } from "~/app/actions/agent-info";
import { useSession } from "~/lib/auth-client";

interface NotaEncargoData {
  documentNumber: string;
  agency: {
    agentName: string;
    collegiateNumber: string;
    agentNIF: string;
    website: string;
    email: string;
    logo?: string;
    accountId?: string;
    offices: Array<{
      address: string;
      city: string;
      postalCode: string;
      phone: string;
    }>;
  };
  client: {
    fullName: string;
    nif: string;
    address: string;
    city: string;
    postalCode: string;
    phone: string;
  };
  property: {
    description: string;
    allowSignage: string;
    energyCertificate: string;
    keyDelivery: string;
    allowVisits: string;
  };
  operation: {
    type: string;
    price: string;
  };
  commission: {
    percentage: number;
    minimum: string;
  };
  duration: {
    months: number;
  };
  signatures: {
    location: string;
    date: string;
  };
  jurisdiction: {
    city: string;
  };
  observations: string;
  hasOtherAgency?: boolean;
  gdprConsent?: boolean;
}

interface Props {
  data: NotaEncargoData;
}

export function NotaEncargoDocument({ data }: Props) {
  const [brandLogo, setBrandLogo] = useState<string | null>(null);
  const [agentName, setAgentName] = useState<string>(data.agency.agentName);
  const [collegiateNumber, setCollegiateNumber] = useState<string>(data.agency.collegiateNumber);
  const [accountType, setAccountType] = useState<string | null>(null);
  const [taxId, setTaxId] = useState<string>(data.agency.agentNIF);
  const [offices, setOffices] = useState<Array<{address: string; city: string; postalCode: string; phone: string}>>(data.agency.offices);
  const [website, setWebsite] = useState<string>(data.agency.website);
  const { data: session } = useSession();
  
  console.log("🔍 NOTA: NotaEncargoDocument rendered with data:", {
    documentNumber: data.documentNumber,
    agentName: data.agency.agentName,
    accountId: data.agency.accountId,
    hasAccountId: !!data.agency.accountId,
    sessionUserId: session?.user?.id
  });

  // Fetch brand logo and agent name
  useEffect(() => {
    const fetchBrandData = async () => {
      try {
        console.log("🔍 NOTA: Attempting to fetch brand data");
        
        if (session?.user?.id) {
          console.log("🔍 NOTA: Getting account ID for user:", session.user.id);
          const userAccountId = await getCurrentUserAccountIdAction();
          
          if (userAccountId) {
            const accountIdStr = userAccountId.toString();
            console.log("🔍 NOTA: Got account ID:", accountIdStr);
            
            // Fetch brand logo
            console.log("🔍 NOTA: Calling getBrandAsset with:", accountIdStr);
            const brandAsset = await getBrandAsset(accountIdStr);
            console.log("🔍 NOTA: getBrandAsset result:", brandAsset);
            
            if (brandAsset && brandAsset.logoTransparentUrl) {
              console.log("🔍 NOTA: Setting brand logo to:", brandAsset.logoTransparentUrl);
              setBrandLogo(brandAsset.logoTransparentUrl);
            } else {
              console.log("🔍 NOTA: No logoTransparentUrl found in brand asset");
            }
            
            // Fetch agent name based on account type
            console.log("🔍 NOTA: Calling getAgentNameAction with:", userAccountId);
            const agentNameResult = await getAgentNameAction(BigInt(userAccountId));
            console.log("🔍 NOTA: getAgentNameAction result:", agentNameResult);
            
            if (agentNameResult.success && agentNameResult.agentName) {
              console.log("🔍 NOTA: Setting agent name to:", agentNameResult.agentName);
              setAgentName(agentNameResult.agentName);
              
              if (agentNameResult.accountType) {
                console.log("🔍 NOTA: Setting account type to:", agentNameResult.accountType);
                setAccountType(agentNameResult.accountType);
              }
              
              if (agentNameResult.collegiateNumber) {
                console.log("🔍 NOTA: Setting collegiate number to:", agentNameResult.collegiateNumber);
                setCollegiateNumber(agentNameResult.collegiateNumber);
              }
              
              if (agentNameResult.taxId) {
                console.log("🔍 NOTA: Setting tax ID to:", agentNameResult.taxId);
                setTaxId(agentNameResult.taxId);
              }
              
              if (agentNameResult.website) {
                console.log("🔍 NOTA: Setting website to:", agentNameResult.website);
                setWebsite(agentNameResult.website);
              }
            } else {
              console.log("🔍 NOTA: No agent name found, using default");
            }
            
            // Fetch office information
            console.log("🔍 NOTA: Calling getOfficeInfoAction with:", userAccountId);
            const officeInfoResult = await getOfficeInfoAction(BigInt(userAccountId));
            console.log("🔍 NOTA: getOfficeInfoAction result:", officeInfoResult);
            
            if (officeInfoResult.success && officeInfoResult.offices) {
              console.log("🔍 NOTA: Setting offices to:", officeInfoResult.offices);
              setOffices(officeInfoResult.offices);
            } else {
              console.log("🔍 NOTA: No office info found, using default");
            }
          } else {
            console.log("🔍 NOTA: No account ID found for user");
          }
        } else {
          console.log("🔍 NOTA: No session user ID");
        }
      } catch (error) {
        console.error("🔍 NOTA: Error fetching brand data:", error);
      }
    };

    void fetchBrandData();
  }, [session?.user?.id]);

  return (
    <div className="bg-white text-black font-sans">
      <style jsx>{`
        @media print {
          .nota-encargo-document {
            width: 210mm;
            height: 297mm;
            margin: 0;
            padding: 20mm;
            font-size: 11pt;
            line-height: 1.4;
          }
          .page-break {
            page-break-before: always;
          }
          .no-print {
            display: none;
          }
        }
        
        .nota-encargo-document {
          max-width: 794px;
          margin: 0 auto;
          padding: 40px;
          min-height: 1123px;
          font-family: Arial, sans-serif;
          font-size: 11pt;
          line-height: 1.4;
        }
        
        .header-section {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .logo-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .agency-logo {
          height: 60px;
          width: auto;
        }
        
        .vesta-logo {
          height: 80px;
          width: auto;
        }
        
        .api-logo {
          height: 40px;
          width: auto;
        }
        
        .agency-title {
          font-size: 14pt;
          font-weight: bold;
          margin-bottom: 8px;
        }
        
        .agent-info {
          font-size: 11pt;
          margin-bottom: 4px;
        }
        
        .services-line {
          font-size: 10pt;
          margin: 15px 0;
          font-style: italic;
        }
        
        .offices-section {
          font-size: 10pt;
          margin: 15px 0;
        }
        
        .separator {
          border-top: 2px solid black;
          margin: 20px 0;
        }
        
        .document-title {
          text-align: center;
          font-size: 14pt;
          font-weight: bold;
          margin: 20px 0;
        }
        
        .client-section {
          margin: 25px 0;
        }
        
        .client-field {
          margin: 8px 0;
          display: flex;
        }
        
        .field-label {
          font-weight: bold;
          min-width: 140px;
        }
        
        .field-value {
          flex: 1;
          border-bottom: 1px solid black;
          padding-bottom: 2px;
        }
        
        .power-section {
          margin: 25px 0;
          text-align: justify;
        }
        
        .operation-section {
          margin: 20px 0;
        }
        
        .operation-field {
          margin: 8px 0;
          display: flex;
        }
        
        .clauses-section {
          margin-top: 30px;
        }
        
        .clause {
          margin: 20px 0;
        }
        
        .clause-title {
          font-weight: bold;
          margin-bottom: 8px;
        }
        
        .clause-content {
          text-align: justify;
          margin-bottom: 12px;
        }
        
        .checkbox-line {
          margin: 12px 0;
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .checkbox {
          width: 12px;
          height: 12px;
          border: 1px solid black;
          display: inline-block;
          text-align: center;
          line-height: 10px;
          font-size: 10px;
        }
        
        .page-footer {
          text-align: center;
          margin: 30px 0;
          border-top: 2px solid black;
          border-bottom: 2px solid black;
          padding: 10px 0;
          font-weight: bold;
        }
        
        .observations-section {
          margin: 30px 0;
        }
        
        .signature-section {
          margin-top: 50px;
        }
        
        .signature-line {
          border-bottom: 1px solid black;
          width: 200px;
          height: 1px;
          margin: 60px 0 10px 0;
        }
        
        .signature-row {
          display: flex;
          justify-content: space-between;
          margin-top: 40px;
        }
        
        .signature-block {
          text-align: center;
          width: 200px;
        }
      `}</style>
      
      <div className="nota-encargo-document">
        {/* Header Section */}
        <div className="header-section">
          <div className="logo-container">
            {data.agency.logo && (
              <img 
                src={data.agency.logo} 
                alt="Logo de la agencia" 
                className="agency-logo"
              />
            )}
            <img 
              src={brandLogo ?? "https://vesta-configuration-files.s3.us-east-1.amazonaws.com/logos/logo-transparent.svg"} 
              alt="Brand Logo" 
              className="vesta-logo"
              onLoad={() => console.log("🔍 NOTA: Brand logo loaded successfully:", brandLogo ?? "fallback")}
              onError={() => console.log("🔍 NOTA: Brand logo failed to load:", brandLogo ?? "fallback")}
            />
            <img 
              src="https://vesta-configuration-files.s3.us-east-1.amazonaws.com/logos/logo_api.png" 
              alt="API Logo" 
              className="api-logo"
            />
          </div>
          <div className="agency-title">AGENCIA DE LA PROPIEDAD INMOBILIARIA</div>
          <div className="agent-info">{agentName}</div>
          {collegiateNumber && accountType !== "company" && (
            <div className="agent-info">Nº Colegiado: {collegiateNumber}</div>
          )}
          <div className="agent-info">
            {accountType === "company" ? "C.I.F" : "N.I.F"}: {taxId}
          </div>
          
          <div className="services-line">
            Servicios: Compra-venta, alquiler y permutas de pisos, chalets, garajes, locales, terrenos y solares
          </div>
          
          <div className="offices-section">
            <strong>OFICINAS:</strong><br />
            {offices.map((office, index) => (
              <div key={index}>
                {office.address}, {office.postalCode} {office.city} (Tel: {office.phone})
              </div>
            ))}
          </div>
          
          <div className="agent-info">{website}</div>
        </div>
        
        <div className="separator"></div>
        
        {/* Document Title */}
        <div className="document-title">
          NOTA DE ENCARGO<br />
          <div style={{ fontSize: '12pt', marginTop: '10px' }}>
            Nº Nota: {data.documentNumber}
          </div>
        </div>
        
        <div className="separator"></div>
        
        {/* Client Data Section */}
        <div className="client-section">
          <div style={{ fontWeight: 'bold', marginBottom: '15px' }}>DATOS DEL CLIENTE:</div>
          
          <div className="client-field">
            <span className="field-label">Apellidos y Nombre:</span>
            <span className="field-value">{data.client.fullName}</span>
          </div>
          
          <div className="client-field">
            <span className="field-label">Vecino/a de:</span>
            <span className="field-value">{data.client.city}</span>
          </div>
          
          <div className="client-field">
            <span className="field-label">Domicilio:</span>
            <span className="field-value">{data.client.address}</span>
          </div>
          
          <div className="client-field">
            <span className="field-label">Distrito Postal:</span>
            <span className="field-value">{data.client.postalCode}</span>
          </div>
          
          <div className="client-field">
            <span className="field-label">N.I.F.:</span>
            <span className="field-value">{data.client.nif}</span>
          </div>
          
          <div className="client-field">
            <span className="field-label">Teléfono:</span>
            <span className="field-value">{data.client.phone}</span>
          </div>
        </div>
        
        <div style={{ margin: '30px 0', borderTop: '1px dashed black' }}></div>
        
        {/* Power Section */}
        <div className="power-section">
          EL CLIENTE da poder a <strong>{agentName}</strong>, A.P.I., {accountType === "company" ? "C.I.F" : "N.I.F"} <strong>{taxId}</strong>, 
          domiciliada en las direcciones reseñadas, para que intervenga en la operación que se describe.
        </div>
        
        {/* Operation Section */}
        <div className="operation-section">
          <div className="operation-field">
            <span className="field-label">Operación:</span>
            <span className="field-value">{data.operation.type}</span>
          </div>
          
          <div className="operation-field">
            <span className="field-label">Descripciones:</span>
            <span className="field-value">{data.property.description}</span>
          </div>
          
          <div className="operation-field">
            <span className="field-label">Condiciones / Precio:</span>
            <span className="field-value">{data.operation.price} €</span>
          </div>
          
          <div className="operation-field">
            <span className="field-label">Autorización colocación de cartel:</span>
            <span className="field-value">{data.property.allowSignage}</span>
          </div>
          
          <div className="operation-field">
            <span className="field-label">Certificación eficiencia energética:</span>
            <span className="field-value">{data.property.energyCertificate}</span>
          </div>
          
          <div className="operation-field">
            <span className="field-label">Entrega de llaves:</span>
            <span className="field-value">{data.property.keyDelivery}</span>
          </div>
          
          <div className="operation-field">
            <span className="field-label">Autorización para visitas:</span>
            <span className="field-value">{data.property.allowVisits}</span>
          </div>
        </div>
        
        <div className="page-footer">
          HOJA 1 DE 2
        </div>
        
        {/* Clauses Section */}
        <div className="clauses-section">
          <div style={{ fontWeight: 'bold', fontSize: '12pt', marginBottom: '20px' }}>
            CLÁUSULAS PRINCIPALES:
          </div>
          
          <div className="clause">
            <div className="clause-title">1. AUTORIZACIÓN AL AGENTE</div>
            <div className="clause-content">
              El cliente autoriza al agente para recibir pagos, firmar contratos de compromiso y realizar 
              las gestiones necesarias para la operación.
            </div>
            <div className="clause-content">
              Si el presente documento es firmado por persona distinta del propietario del inmueble, 
              dicha persona se constituye en responsable solidario de las obligaciones contraídas.
            </div>
          </div>
          
          <div className="clause">
            <div className="clause-title">2. COMISIONES Y PAGOS</div>
            <div className="clause-content">
              El cliente abonará una comisión del <strong>{data.commission.percentage}% + IVA</strong>, 
              con un mínimo de <strong>{data.commission.minimum} €</strong>.
            </div>
            <div className="clause-content">
              El agente podrá deducir su comisión de las cantidades que reciba.
            </div>
            <div className="clause-content">
              Las cantidades entregadas como depósito permanecerán en poder del agente hasta la firma de la escritura.
            </div>
            <div className="clause-content">
              Si la venta no se realiza por incumplimiento de cualquiera de las partes, el cliente deberá 
              abonar el 100% de la comisión + IVA.
            </div>
          </div>
          
          <div className="clause">
            <div className="clause-title">3. DURACIÓN</div>
            <div className="clause-content">
              El presente encargo tendrá una duración de <strong>{data.duration.months} meses</strong>, renovable.
            </div>
            <div className="clause-content">
              Si posteriormente se realiza la venta con persona que hubiera conocido el inmueble a través 
              de la agencia, el cliente deberá abonar la comisión.
            </div>
          </div>
          
          <div className="clause">
            <div className="clause-title">4. OTRAS AGENCIAS</div>
            <div className="clause-content">
              ¿Se ha encomendado el inmueble a otra agencia?
            </div>
            <div className="checkbox-line">
              <span className="checkbox">{data.hasOtherAgency ? '✓' : ''}</span>
              <span>SÍ</span>
              <span className="checkbox">{!data.hasOtherAgency ? '✓' : ''}</span>
              <span>NO</span>
              <span>(Táchese lo que no proceda)</span>
            </div>
          </div>
          
          <div className="clause">
            <div className="clause-title">5. ESTADO DEL INMUEBLE</div>
            <div className="clause-content">
              La venta deberá realizarse libre de cargas, gravámenes, inquilinos, etc.
            </div>
          </div>
          
          <div className="clause">
            <div className="clause-title">6. PROTECCIÓN DE DATOS</div>
            <div className="clause-content">
              En cumplimiento del Reglamento UE 2016/679 (GDPR), le informamos:
            </div>
            <div className="clause-content">
              - Sus datos serán utilizados para la gestión de la operación inmobiliaria<br />
              - Se conservarán durante el tiempo necesario para cumplir la finalidad<br />
              - Puede ejercer sus derechos de acceso, rectificación, supresión ante {data.agency.email}
            </div>
            <div className="clause-content">
              ¿Autoriza el uso de sus datos para comunicaciones comerciales?
            </div>
            <div className="checkbox-line">
              <span className="checkbox">{data.gdprConsent ? '✓' : ''}</span>
              <span>SÍ</span>
              <span className="checkbox">{!data.gdprConsent ? '✓' : ''}</span>
              <span>NO</span>
            </div>
          </div>
          
          <div className="clause">
            <div className="clause-title">7. JURISDICCIÓN</div>
            <div className="clause-content">
              Las controversias se resolverán en los juzgados de <strong>{data.jurisdiction.city}</strong>.
            </div>
          </div>
        </div>
        
        <div className="page-footer page-break">
          HOJA 2 DE 2
        </div>
        
        {/* Observations Section */}
        <div className="observations-section">
          <div style={{ fontWeight: 'bold', marginBottom: '15px' }}>OBSERVACIONES:</div>
          <div style={{ minHeight: '80px', borderBottom: '1px solid black', marginBottom: '10px' }}>
            {data.observations}
          </div>
          <div style={{ borderBottom: '1px solid black', height: '20px', marginBottom: '10px' }}></div>
          <div style={{ borderBottom: '1px solid black', height: '20px', marginBottom: '20px' }}></div>
        </div>
        
        {/* Signature Section */}
        <div className="signature-section">
          <div style={{ marginBottom: '40px' }}>
            En <strong>{data.signatures.location}</strong>, a <strong>{data.signatures.date}</strong>
          </div>
          
          <div className="signature-row">
            <div className="signature-block">
              <div style={{ marginBottom: '60px', fontWeight: 'bold' }}>EL CLIENTE</div>
              <div className="signature-line"></div>
              <div>Firma</div>
            </div>
            
            <div className="signature-block">
              <div style={{ marginBottom: '60px', fontWeight: 'bold' }}>
                Dª. {agentName}<br />
                (Agente)
              </div>
              <div className="signature-line"></div>
              <div>Firma</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}