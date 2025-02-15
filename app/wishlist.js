import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, Image, ActivityIndicator, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function Wishlist() {
    const router = useRouter();
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                if (!token) {
                    router.replace('/login');
                    return;
                }

                const response = await axios.get('http://172.20.10.2/api/wishlist', {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 10000,
                });

                console.log('Wishlist response:', response.data);

                if (response.data && Array.isArray(response.data)) {
                    // Récupérer les détails de chaque carte
                    const cardsData = await Promise.all(
                        response.data.map(async (item) => {
                            try {
                                const cardResponse = await axios.get(
                                    `http://172.20.10.2/api/cards/${item.card_id}`,
                                    {
                                        headers: { Authorization: `Bearer ${token}` },
                                        timeout: 10000,
                                    }
                                );
                                return cardResponse.data;
                            } catch (error) {
                                console.error(`Erreur récupération carte ${item.card_id}:`, error);
                                return null;
                            }
                        })
                    );

                    const validCards = cardsData.filter(card => card !== null);
                    console.log('Cards with details:', validCards);
                    setWishlistItems(validCards);
                }
            } catch (error) {
                console.error('Erreur récupération wishlist:', error);
                Alert.alert(
                    'Erreur',
                    'Impossible de récupérer la wishlist. Veuillez réessayer plus tard.'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchWishlist();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3498db" />
                <Text style={styles.loadingText}>Chargement de la wishlist...</Text>
            </View>
        );
    }

    if (wishlistItems.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Votre wishlist est vide</Text>
                </View>
                <View style={styles.bottomNavContainer}>
                    <TouchableOpacity 
                        style={styles.navButton} 
                        onPress={() => router.replace('/')}
                    >
                        <Ionicons name="home" size={32} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.navButton} 
                        onPress={() => router.replace('/wishlist')}
                    >
                        <Ionicons name="heart" size={32} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.navButton} 
                        onPress={() => router.replace('/profile')}
                    >
                        <Ionicons name="person" size={32} color="white" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Ma Wishlist</Text>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {wishlistItems.map((card) => (
                    <TouchableOpacity 
                        key={card.id} 
                        style={styles.cardContainer}
                        onPress={() => router.push(`/cardDetail?id=${card.id}`)}
                    >
                        <Image 
                            source={{ uri: card.image }} 
                            style={styles.cardImage} 
                            resizeMode="contain"
                        />
                        <View style={styles.cardInfo}>
                            <Text style={styles.cardName}>{card.name}</Text>
                            <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={styles.bottomNavContainer}>
                <TouchableOpacity 
                    style={styles.navButton} 
                    onPress={() => router.replace('/')}
                >
                    <Ionicons name="home" size={32} color="white" />
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.navButton} 
                    onPress={() => router.replace('/wishlist')}
                >
                    <Ionicons name="heart" size={32} color="white" />
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.navButton} 
                    onPress={() => router.replace('/profile')}
                >
                    <Ionicons name="person" size={32} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#fff', 
        paddingTop: 50, 
        paddingBottom: 90  
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F7FAFC',
    },
    loadingText: {
        color: '#718096',
        marginTop: 16,
        fontSize: 16,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F7FAFC',
        padding: 16,
    },
    emptyText: {
        fontSize: 18,
        color: '#718096',
        marginTop: 16,
        marginBottom: 24,
    },
    title: { 
        fontSize: 26, 
        fontWeight: 'bold', 
        textAlign: 'center', 
        marginBottom: 20, 
        color: '#333' 
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 90,
    },
    cardContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardImage: {
        width: 80,
        height: 112,
        borderRadius: 8,
    },
    cardInfo: {
        flex: 1,
        marginLeft: 16,
    },
    cardName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A202C',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#4A5568',
    },
    bottomNavContainer: {
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
        width: '33%',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
