import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const router = useRouter();

    const handleRegister = async () => {
        if (!name || !email || !password || !confirmPassword) {
          Alert.alert("Erreur", "Veuillez remplir tous les champs");
          return;
        }
      
        if (password !== confirmPassword) {
          Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
          return;
        }
      
        try {
          const response = await fetch('http://172.20.10.2/api/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password })
          });
      
          const data = await response.json();
      
          if (response.ok) {
            Alert.alert("Succès", "Compte créé avec succès", [
              { text: "OK", onPress: () => router.push('/login') }
            ]);
          } else {
            Alert.alert("Erreur", data.message || "Une erreur est survenue");
          }
        } catch (error) {
          Alert.alert("Erreur", "Impossible de s'inscrire. Veuillez réessayer plus tard.");
        }
      };
    return (
        <View style={styles.container}>
            <Image source={require('../assets/splash-icon.png')} style={styles.logo} resizeMode="contain" />
            
            <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Pseudo"
            />
            <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Mot de passe"
                secureTextEntry
            />
            <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirmation du mot de passe"
                secureTextEntry
            />
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>S'inscrire</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.link}>Déjà un compte ? Se connecter</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
    },
    logo: {
        width: '60%',
        height: 150,
        marginBottom: 30,
    },
    input: {
        width: '100%',
        padding: 16,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 12,
        marginBottom: 15,
        backgroundColor: '#fff',
        fontSize: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    button: {
        width: '100%',
        padding: 16,
        backgroundColor: '#6A0DAD', // Fond violet
        borderRadius: 12,
        marginBottom: 15,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    link: {
        marginTop: 15,
        color: '#007BFF',
        textDecorationLine: 'underline',
        fontSize: 16,
    }
});
