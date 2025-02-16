import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Collection() {
    const [collectionItems, setCollectionItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchCollection = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                if (!token) {
                    router.replace('/login');
                    return;
                }

                const response = await axios.get('http://172.20.10.2/api/collection', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log('Collection Items:', response.data);
                console.log('Nombre d\'éléments dans la collection :', response.data.length);

                // Récupérer les détails complets de chaque carte
                const detailedCards = await Promise.all(
                    response.data.map(async (collectionItem) => {
                        try {
                            const cardResponse = await axios.get(`http://172.20.10.2/api/cards/${collectionItem.card_id}`);
                            // Combiner les données de la carte avec l'ID de la collection
                            return {
                                ...cardResponse.data,
                                collectionId: collectionItem.id // Garder l'ID de la collection
                            };
                        } catch (error) {
                            console.error(`Erreur lors de la récupération des détails de la carte ${collectionItem.card_id}:`, error);
                            return collectionItem;
                        }
                    })
                );

                setCollectionItems(detailedCards);
            } catch (error) {
                console.error('Erreur lors de la récupération de la collection:', error);
                Alert.alert('Erreur', 'Impossible de récupérer la collection.');
            } finally {
                setLoading(false);
            }
        };

        fetchCollection();
    }, []);

    const handleRemoveFromCollection = async (collectionId) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                router.replace('/login');
                return;
            }

            console.log('Suppression de l\'entrée de collection avec ID:', collectionId);
            await axios.post('http://172.20.10.2/api/collection/remove', { id: collectionId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCollectionItems(prevItems => prevItems.filter(item => item.collectionId !== collectionId));
            Alert.alert('Succès', 'Carte retirée de votre collection.');
        } catch (error) {
            console.error('Erreur lors de la suppression de la collection:', error.response?.data || error);
            Alert.alert('Erreur', 'Impossible de retirer la carte de la collection.');
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6a5acd" />
                <Text style={styles.loadingText}>Chargement de la collection...</Text>
            </View>
        );
    }

    if (collectionItems.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Votre collection est vide</Text>
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
                        onPress={() => router.replace('/collection')}
                    >
                        <Ionicons name="folder" size={32} color="white" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Ma Collection</Text>
            <FlatList
                key="grid"
                data={collectionItems}
                keyExtractor={item => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={styles.row}
                renderItem={({ item }) => (
                    <View style={styles.cardContainer}>
                        <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="contain" />
                        <View style={styles.cardInfo}>
                            <Text style={styles.cardName}>{item.name}</Text>
                            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                            <TouchableOpacity onPress={() => handleRemoveFromCollection(item.collectionId)} style={styles.removeButton}>
                                <Text style={styles.buttonText}>Retirer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />
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
                    onPress={() => router.replace('/collection')}
                >
                    <Ionicons name="folder" size={32} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#6a5acd',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        color: '#6a5acd',
        textAlign: 'center',
    },
    bottomNavContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#6A0DAD',
        padding: 10,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    navButton: {
        padding: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center'
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    cardContainer: {
        width: '48%',
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 8,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardImage: {
        width: '100%',
        height: 200,
        marginBottom: 8,
        borderRadius: 8,
    },
    cardInfo: {
        width: '100%',
        alignItems: 'center',
    },
    cardName: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 8,
    },
    removeButton: {
        backgroundColor: '#6a5acd',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        marginTop: 4,
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    }
});
