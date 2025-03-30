import { IonButton, IonContent, IonHeader, IonInput, IonItemDivider, IonLabel, IonTitle, IonToolbar } from "@ionic/react"
import { useContext, useState } from "react"
import { mycontext } from "../App"

const Settings = () => {
    const [BaseURL, setBaseURL] = useState(null);
    const ctx = useContext(mycontext);

    return (
        <IonContent>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Settings</IonTitle>
                </IonToolbar>
            </IonHeader>

            <>
                <IonLabel>Server base URL</IonLabel>
                <IonInput type="text" mode="md" fill="outline" />
            </>
            <IonItemDivider />
            <IonItemDivider />
            <>
                <IonButton color={"danger"} expand="block" onClick={() => {
                    if (confirm("Are you sure?")) {
                        ctx?.showMessage("Okay, bye...", "warning")
                        ctx?.User?.setUser(null)
                    }
                }}>
                    LOG OFF
                </IonButton>
            </>

        </IonContent>
    )
}

export default Settings