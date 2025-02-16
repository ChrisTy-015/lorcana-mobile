import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  SafeAreaView, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const [email, setEmail] = useState('');
  const [wishlistCount, setWishlistCount] = useState(0);
  const [collectionCount, setCollectionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Début de la requête API...');
        const token = await AsyncStorage.getItem('userToken');
        console.log('Token récupéré:', token);

        if (!token) {
          console.log('Pas de token trouvé, redirection vers login...');
          router.push('/login');
          return;
        }

        // Récupérer les données utilisateur
        const userResponse = await fetch('http://172.20.10.2/api/me', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Récupérer les données de la wishlist
        const wishlistResponse = await fetch('http://172.20.10.2/api/wishlist', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Récupérer les données de la collection
        const collectionResponse = await fetch('http://172.20.10.2/api/collection', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setEmail(userData.email);
        } else {
          console.error('Erreur de réponse utilisateur:', await userResponse.text());
        }

        if (wishlistResponse.ok) {
          const wishlistData = await wishlistResponse.json();
          if (Array.isArray(wishlistData)) {
            setWishlistCount(wishlistData.length);
          }
        } else {
          console.error('Erreur de réponse wishlist:', await wishlistResponse.text());
        }
        
        if (collectionResponse.ok) {
          const collectionData = await collectionResponse.json();
          if (Array.isArray(collectionData)) {
            setCollectionCount(collectionData.length);
          }
        } else {
          console.error('Erreur de réponse collection:', await collectionResponse.text());
        }
      } catch (error) {
        console.error('Erreur complète:', error);
        Alert.alert('Erreur', 'Une erreur est survenue lors de la récupération des informations');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch('http://172.20.10.2/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Supprimer le token quoi qu'il arrive
      await AsyncStorage.removeItem('userToken');
      
      if (response.ok) {
        Alert.alert('Déconnexion réussie', 'À bientôt !');
        router.push('/login');
      } else {
        console.error('Erreur lors de la déconnexion:', await response.text());
        Alert.alert('Erreur', 'Impossible de se déconnecter');
        router.push('/login');
      }
    } catch (error) {
      console.error('Erreur complète lors de la déconnexion:', error);
      await AsyncStorage.removeItem('userToken');
      Alert.alert('Erreur', 'Une erreur est survenue lors de la déconnexion');
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6A0DAD" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileCard}>
        <Text style={styles.profileTitle}>Mon Profil</Text>
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Email :</Text>
          <Text style={styles.infoText}>{email}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Cartes en Wishlist :</Text>
          <Text style={styles.infoText}>{wishlistCount}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Cartes en Collection :</Text>
          <Text style={styles.infoText}>{collectionCount}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>

      {/* Barre de navigation en bas */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={() => router.push('/')}
        >
          <Ionicons name="home" size={32} color="white" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={() => router.push('/wishlist')}
        >
          <Ionicons name="heart" size={32} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80, // Espace pour la barre de navigation
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 30,
  },
  profileTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
    marginRight: 10,
  },
  infoText: {
    fontSize: 18,
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#6A0DAD',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#6A0DAD',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    zIndex: 1000,
  },
  navButton: {
    width: '40%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
