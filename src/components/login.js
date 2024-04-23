import { GoogleLogin, useGoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useState } from "react";

// const clienId =  "311597939342-9gm0olfshbia9ebfgv0e443oqbupuuf8.apps.googleusercontent.com";

function Login(props) {
    const onSuccess = (res) => {
        props.setLogin(true);
        props.user(jwtDecode(res.credential));
    }

    const onFailure = (res) => {
        console.log('Login failed: res:', res);
    }

    return (
        <div>
            <GoogleLogin
                onSuccess={onSuccess}
                onFailure={onFailure}
            /> 
        </div>
    )
}

export default Login;