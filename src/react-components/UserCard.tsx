import React from "react";
import { IUser } from "../classes/User";
import { useTranslation } from "./LanguageContext";

interface UserCardProps {
  user: IUser;
  projectRole?: string; // Add projectRole prop
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, projectRole, onEdit, onDelete }) => {
  const { t } = useTranslation();
  return (
    <div
      className="userCard user-card-hover"
      onClick={() => user.id && onEdit && onEdit(user.id as string)}
    >
      <span className="material-icons-round">person</span>
      <span>{user.name} {user.surname}</span>
      <span>{projectRole ? projectRole : (t(`projects_role_${user.role?.toLowerCase()}`) || user.role)}</span>
      <span>{user.company}</span>
      <button
        className="buttonTertiary"
        style={{background: '#FC3140', color: 'white', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 8, justifySelf: 'end'}}
        title={t("users_delete_user") || "Delete user"}
        onClick={e => {
          e.stopPropagation();
          if (onDelete && user.id) onDelete(user.id as string);
        }}
      >
        <span className="material-icons-round" style={{fontSize: 18}}>close</span>
      </button>
    </div>
  );
};

export default UserCard;
