import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { View, Text, Button, Alert } from 'react-native';

export default function Layout() {
    const [appReady, setAppReady] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        async function prepare() {
            try {
                await SplashScreen.preventAutoHideAsync();
                await new Promise(resolve => setTimeout(resolve, 2000));
                setAppReady(true);
            } catch (e) {
                console.warn(e);
            } finally {
                await SplashScreen.hideAsync();
            }
        }

        prepare();
    }, []);

    useEffect(() => {
        if (appReady && !isAuthenticated) {
            router.replace('/login');
        }
    }, [appReady, isAuthenticated]);

    return appReady ? (
        <Stack>
            <Stack.Screen name="login" options={{ title: 'Connexion' }} />
            <Stack.Screen name="register" options={{ title: 'Inscription' }} />
            <Stack.Screen name="index" options={{ title: 'Accueil' }} />
            <Stack.Screen name="profile" options={{ title: 'Mon Compte' }} />
            <Stack.Screen name="cardList" options={{ title: 'Liste des Cartes' }} />
            <Stack.Screen name="cardDetail" options={{ title: 'Détail de la Carte' }} />
            <Stack.Screen name="wishlist" options={{ title: 'Wishlist' }} /> 
        </Stack>
    ) : null;
}
