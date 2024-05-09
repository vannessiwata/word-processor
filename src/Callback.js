import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function GoogleCallback() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({});
    const [user, setUser] = useState(null);
    const location = useLocation();
    const navigate = useNavigate(); // Use useNavigate instead of useHistory

    useEffect(() => {
        fetch(`http://127.0.0.1:8000/api/auth/callback${location.search}`, {
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            setLoading(false);
            setData(data);

            localStorage.setItem('accessToken', data.access_token);
            navigate('/'); 
        })
        .catch((error) => {
            console.error('Error fetching data:', error);
            setLoading(false);
        });
    }, [location.search]);

    function fetchUserData() {
        const token = localStorage.getItem('accessToken');
       
        if (token) {
            fetch(`http://127.0.0.1:8000/api/user`, {
                headers : {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': 'Bearer ' + token,
                }
            })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }
                return response.json();
            })
            .then((userData) => {
                setUser(userData);
            })
            .catch((error) => {
                console.error('Error fetching user data:', error);
            });
        } else {
            console.error('Access token not found');
        }
    }

    useEffect(() => {
        if (user !== null) {
            navigate('/'); // Use navigate instead of history.push
        }
    }, [user, navigate]);

    if (loading) {
        return <DisplayLoading />;
    } else {
        if (user != null) {
            return <DisplayData data={user} />;
        } else {
            return (
                <div>
                    <DisplayData data={data} />
                    <div style={{ marginTop: 10 }}>
                        <button onClick={fetchUserData}>Fetch User</button>
                    </div>
                </div>
            );
        }
    }
}

function DisplayLoading() {
    return <div>Loading....</div>;
}

function DisplayData({ data }) {
    return (
        <div>
            <samp>{JSON.stringify(data, null, 2)}</samp>
        </div>
    );
}

export default GoogleCallback;
