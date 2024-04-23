import { googleLogout } from "@react-oauth/google";

const clienId = "311597939342-9gm0olfshbia9ebfgv0e443oqbupuuf8.apps.googleusercontent.com";

function Logout(){
    const logout = () => {
        console.log('Logout');
    }

    return (
        <div id="signout-button">
            <googleLogout
                clientId={clienId}
                buttonText="Logout"
                onLogoutSuccess={logout}
            />
        </div>
    )
}

export default Logout;