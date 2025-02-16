import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, ActivityIndicator, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';

export default function CardDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [card, setCard] = useState(null);
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [isInCollection, setIsInCollection] = useState(false);

    const handleWishlistToggle = async () => {
        try {
            if (!card) return;

            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                router.replace('/login');
                return;
            }

            console.log('Card data:', card);
            
            if (isInWishlist) {
                const removeData = { card_id: card.id };
                console.log('Removing card with data:', removeData);
                
                await axios.post('http://172.20.10.2/api/wishlist/remove', removeData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setIsInWishlist(false);
                Alert.alert('Succès', 'Carte retirée de la wishlist');
            } else {
                const addData = { card_id: card.id };
                console.log('Adding card with data:', addData);
                
                await axios.post('http://172.20.10.2/api/wishlist/add', addData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setIsInWishlist(true);
                Alert.alert('Succès', 'Carte ajoutée à la wishlist');
            }
        } catch (error) {
            console.error('Erreur lors de la gestion de la wishlist:', error);
            Alert.alert('Erreur', 'Impossible de mettre à jour la wishlist');
        }
    };

    const handleCollectionToggle = async () => {
        try {
            if (!card) return;

            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                router.replace('/login');
                return;
            }

            // Vérifier si la carte est déjà dans la collection
            if (isInCollection) {
                await axios.post('http://172.20.10.2/api/collection/remove', { id: card.id }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setIsInCollection(false);
                Alert.alert('Succès', 'Carte retirée de votre collection.');
            } else {
                // Vérifiez si la carte est déjà dans la collection avant d'ajouter
                const collectionResponse = await axios.get('http://172.20.10.2/api/collection', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const alreadyInCollection = collectionResponse.data.some(item => item.id === card.id);
                if (alreadyInCollection) {
                    Alert.alert('Erreur', 'Cette carte est déjà dans votre collection.');
                    return;
                }

                console.log('ID de la carte:', card.id);
                const addData = { card_id: card.id };
                await axios.post('http://172.20.10.2/api/collection/add', addData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setIsInCollection(true);
                Alert.alert('Succès', 'Carte ajoutée à votre collection.');
            }
        } catch (error) {
            console.error('Erreur lors de la gestion de la collection:', error.response.data);
            console.error('Détails de l erreur:', error);
            Alert.alert('Erreur', 'Impossible de mettre à jour la collection.');
        }
    };

    useEffect(() => {
        const checkWishlist = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                if (!token) return;

                const response = await axios.get('http://172.20.10.2/api/wishlist', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                console.log('Checking wishlist status for card:', id);
                console.log('Wishlist data:', response.data);

                if (response.data && Array.isArray(response.data)) {
                    const isInList = response.data.some(item => String(item.card_id) === String(id));
                    console.log('Is card in wishlist?', isInList);
                    setIsInWishlist(isInList);
                }
            } catch (error) {
                console.error('Erreur lors de la vérification de la wishlist:', error);
            }
        };
        checkWishlist();
    }, [id]);

    useEffect(() => {
        const checkCollection = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                if (!token) return;

                const response = await axios.get('http://172.20.10.2/api/collection', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                console.log('Checking collection status for card:', id);
                console.log('Collection data:', response.data);

                if (response.data && Array.isArray(response.data)) {
                    const isInList = response.data.some(item => String(item.card_id) === String(id));
                    console.log('Is card in collection?', isInList);
                    setIsInCollection(isInList);
                }
            } catch (error) {
                console.error('Erreur lors de la vérification de la collection:', error);
            }
        };
        checkCollection();
    }, [id]);

    // Recharger l'état de la wishlist et de la collection quand la page devient active
    useFocusEffect(
        useCallback(() => {
            const checkWishlist = async () => {
                try {
                    const token = await AsyncStorage.getItem('userToken');
                    if (!token) return;

                    const response = await axios.get('http://172.20.10.2/api/wishlist', {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (response.data && Array.isArray(response.data)) {
                        const isInList = response.data.some(item => String(item.card_id) === String(id));
                        setIsInWishlist(isInList);
                    }
                } catch (error) {
                    console.error('Erreur lors de la vérification de la wishlist:', error);
                }
            };
            checkWishlist();

            const checkCollection = async () => {
                try {
                    const token = await AsyncStorage.getItem('userToken');
                    if (!token) return;

                    const response = await axios.get('http://172.20.10.2/api/collection', {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (response.data && Array.isArray(response.data)) {
                        const isInList = response.data.some(item => String(item.card_id) === String(id));
                        setIsInCollection(isInList);
                    }
                } catch (error) {
                    console.error('Erreur lors de la vérification de la collection:', error);
                }
            };
            checkCollection();
        }, [id])
    );

    useEffect(() => {
        fetch(`http://172.20.10.2/api/cards/${id}`)
            .then(response => response.json())
            .then(data => {
                console.log('Données de la carte reçues:', data);
                console.log('URL de l\'image:', data.image);
                setCard(data);
            })
            .catch(error => console.error("Erreur :", error));
    }, [id]);

    if (!card) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3498db" />
                <Text style={styles.loadingText}>Chargement...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
            <Text style={styles.title}>{card.name}</Text>
            <Text style={styles.subtitle}>{card.subtitle}</Text> 
            <View style={styles.cardContainer}>
                <Image source={{ uri: card.image }} style={styles.cardImage} resizeMode="contain" />
                <Text style={styles.description}>{card.description}</Text>
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.wishlistButton, isInWishlist && styles.activeButton]} onPress={handleWishlistToggle}>
                    <Ionicons name={isInWishlist ? "heart" : "heart-outline"} size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.collectionButton, isInCollection && styles.activeButton]} onPress={handleCollectionToggle}>
                    <Ionicons name="add-circle" size={24} color="white" />
                </TouchableOpacity>
            </View>
            <Text style={styles.collectionInfo}>Standard ({card.standard}) · Brillante ({card.brillante})</Text>
            <View style={styles.navbar}>
                <TouchableOpacity onPress={() => router.push("/")}>
                    <Text><Ionicons name="home" size={32} color="white" /></Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push("/wishlist")}>
                    <Text><Ionicons name="heart" size={32} color="white" /></Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.collectionButton, isInCollection && styles.activeButton]} onPress={() => router.push('/collection')}>
                    <Ionicons name="folder-open" size={24} color="white" />
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7FAFC' },
    loadingText: { color: '#718096', marginTop: 16, fontSize: 16 },
    scrollView: { flex: 1, backgroundColor: '#F7FAFC', width: '100%' },
    title: { fontSize: 28, fontWeight: 'bold', color: '#1A202C', marginBottom: 4 },
    subtitle: { fontSize: 18, color: '#4A5568', marginBottom: 16 },
    container: { flexGrow: 1, alignItems: 'center', padding: 16, paddingBottom: 80 },
    cardContainer: { backgroundColor: 'white', borderRadius: 16, padding: 16, alignItems: 'center', width: '100%', elevation: 5 },
    cardImage: { width: 288, height: 400, marginBottom: 16, borderRadius: 12 },
    description: { fontSize: 16, color: '#4A5568', textAlign: 'center', marginTop: 16, paddingHorizontal: 16, lineHeight: 24 },
    buttonContainer: { flexDirection: 'row', marginTop: 24, gap: 12 },
    wishlistButton: { backgroundColor: '#E53E3E', width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', elevation: 5 },
    collectionButton: { backgroundColor: '#6A0DAD', width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', elevation: 5 },
    activeButton: { opacity: 0.6 },
    collectionInfo: { fontSize: 16, color: '#4A5568', marginTop: 8 },
    navbar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#6A0DAD', padding: 16, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopLeftRadius: 16, borderTopRightRadius: 16, elevation: 5 },
});
