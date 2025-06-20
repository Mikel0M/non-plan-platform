import React from "react";
import { useTranslation } from "../context/LanguageContext";

interface CompanyCardProps {
  company: {
    id: string;
    name: string;
    address?: string;
    email?: string;
    phone?: string;
  };
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company, onEdit, onDelete }) => {
  const { t } = useTranslation();
  return (
    <div
      className="userCard user-card-hover"
      style={{ display: 'grid', gridTemplateColumns: '40px 2fr 2fr 2fr 1fr 40px', gap: 10, alignItems: 'center', background: 'var(--background-100)', padding: 10, borderRadius: 8, cursor: 'pointer', boxSizing: 'border-box' }}
      onClick={() => onEdit && onEdit(company.id)}
    >
      <span className="material-icons-round">business</span>
      <span>{company.name}</span>
      <span>{company.address}</span>
      <span>{company.email}</span>
      <span>{company.phone}</span>
      <button
        className="buttonTertiary"
        style={{background: '#FC3140', color: 'white', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 8, justifySelf: 'end'}}
        title={t("users_delete_company") || "Delete company"}
        onClick={e => {
          e.stopPropagation();
          if (onDelete) onDelete(company.id);
        }}
      >
        <span className="material-icons-round" style={{fontSize: 18}}>close</span>
      </button>
    </div>
  );
};

export default CompanyCard;
