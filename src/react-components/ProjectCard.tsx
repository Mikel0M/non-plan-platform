import * as React from "react"
import { Project } from "../classes/Project"
import { useTranslation } from "./LanguageContext";

interface Props {
    project: Project
}

export function ProjectCard(props: Props) {
    const { t } = useTranslation();
    // Helper to translate status and role
    const translateStatus = (status: string) => t(`projects_status_${status.toLowerCase()}`) || status;
    const translateRole = (role: string) => t(`projects_role_${role.toLowerCase()}`) || role;
    return (
        <div className="projectCard">
            <div
                className="cardHeader"
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16, // Add space between MM and project info
                    height: 35,
                }}
            >
                <p
                    style={{
                        fontSize: 20,
                        display: "flex",
                        alignItems: "center",
                        backgroundColor: props.project.color, // Pass as string, not object
                        padding: 10,
                        width: 40,
                        height: 40,
                        justifyContent: "center",
                        borderRadius: 8,
                        aspectRatio: 1,
                        margin: 0, // Remove default margin
                    }}
                >
                    { props.project.icon }
                </p>
                <div>
                    <h5 style={{ margin: 0 }}>{ props.project.name }</h5>
                    <p style={{ margin: 0 }}>{ props.project.description}</p>
                </div>
            </div>
            <div className="cardContent">
                <div className="cardProperty">
                    <p style={{ color: "#969696" }}>{t("projects_status") || "Status"}</p>
                    <p>{ translateStatus(props.project.status) }</p>
                </div>
                <div className="cardProperty">
                    <p style={{ color: "#969696" }}>{t("projects_role") || "Role"}</p>
                    <p>{ translateRole(props.project.userRole) }</p>
                </div>
                <div className="cardProperty">
                    <p style={{ color: "#969696" }}>{t("projects_cost") || "Cost"}</p>
                    <p>{ props.project.cost }</p>
                </div>
                <div className="cardProperty">
                    <p style={{ color: "#969696" }}>{t("projects_progress") || "Progress"}</p>
                    <p>{ props.project.progress }%</p>
                </div>
            </div>
        </div>
    )
}