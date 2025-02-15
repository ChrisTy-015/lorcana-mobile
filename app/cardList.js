import { Link, useRouter } from "expo-router";
import {
  FlatList,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  Button,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CardList() {
  const router = useRouter();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterWishlist, setFilterWishlist] = useState(null);
  const [wishlistCards, setWishlistCards] = useState([]);
  const [sorted, setSorted] = useState(false);

  const { id } = useLocalSearchParams();

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError("ID du set non spécifié");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Récupérer les cartes du set
        const cardsResponse = await fetch(
          `http://172.20.10.2/api/sets/${id}/cards`,
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            credentials: "omit",
          }
        );

        // Récupérer la wishlist
        const token = await AsyncStorage.getItem('userToken');
        const wishlistResponse = await fetch('http://172.20.10.2/api/wishlist', {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!cardsResponse.ok) {
          throw new Error(`Erreur HTTP: ${cardsResponse.status}`);
        }

        const cardsData = await cardsResponse.json();
        if (Array.isArray(cardsData)) {
          setCards(cardsData);
        } else if (cardsData && Array.isArray(cardsData.data)) {
          setCards(cardsData.data);
        } else {
          console.warn("Format de données inattendu:", cardsData);
          setCards([]);
          setError("Format de données incorrect");
        }

        if (wishlistResponse.ok) {
          const wishlistData = await wishlistResponse.json();
          if (Array.isArray(wishlistData)) {
            setWishlistCards(wishlistData.map(item => item.card_id));
          }
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des données:", err);
        setError(`Erreur de chargement des données: ${err.message}`);
        setCards([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const filteredCards = cards.filter(
    (card) =>
      card.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (filterWishlist === null || 
        (filterWishlist === true ? wishlistCards.includes(card.id) : !wishlistCards.includes(card.id))
      )
  );

  const sortedCards = sorted
    ? [...filteredCards].sort((a, b) => a.name.localeCompare(b.name))
    : filteredCards;

  if (loading)
    return (
      <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
    );
  if (error) return <Text style={styles.error}>{error}</Text>;

  return (
    <View style={styles.container}>
      {/* Barre latérale */}
      <View style={styles.sidebar}>
        <TouchableOpacity onPress={() => router.push("/")}>
          <Ionicons name="home" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/wishlist")}>
          <Ionicons name="heart" size={30} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Liste des Cartes</Text>

        {/* Barre de recherche */}
        <TextInput
          style={styles.searchBar}
          placeholder="Rechercher une carte..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* Filtres */}
        <View style={styles.filters}>
          <Button title="Wishlist" onPress={() => setFilterWishlist(true)} />
          <Button title="Toutes" onPress={() => setFilterWishlist(null)} />
        </View>

        {/* Bouton de tri */}
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setSorted(!sorted)}
        >
          <Text style={styles.sortText}>
            {sorted ? "Tri: A-Z" : "Trier A-Z"}
          </Text>
        </TouchableOpacity>

        {/* Liste des cartes */}
        <FlatList
          data={sortedCards}
          numColumns={2}
          keyExtractor={(card) => card.id.toString()}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Link
              key={item.id}
              href={`/cardDetail?id=${item.id}`}
              style={styles.cardContainer}
            >
              <Image
                style={styles.image}
                source={{ uri: item.thumbnail }}
                placeholder={require("../assets/back.png")}
                transition={500}
                contentFit="cover"
                resizeMode="cover" 
                onError={(error) => {
                  console.error(
                    "Erreur de chargement image:",
                    item.name,
                    error
                  );
                  console.log("URL de l'image:", item.thumbnail);
                }}
                onLoad={() => {
                  console.log("Image chargée avec succès:", item.name);
                }}
              />
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{item.name}</Text>
                <Text style={styles.cardVersion}>{item.version}</Text>
                <Text style={styles.cardNumber}>#{item.number}</Text>
                <Text style={styles.cardRarity}>{item.rarity}</Text>
              </View>
            </Link>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#fff",
  },
  sidebar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "#6A0DAD",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    zIndex: 1000,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 80, 
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },
  searchBar: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
  },
  filters: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 10,
  },
  sortButton: {
    backgroundColor: "#6a5acd",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  sortText: {
    color: "white",
    fontWeight: "bold",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  error: {
    color: "red",
    fontSize: 16,
  },
  cardContainer: {
    width: '46%', 
    aspectRatio: 0.55, 
    margin: '2.5%',
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    padding: 10,
  },
  
  image: {
    width: "100%",
    height: 210, 
    borderRadius: 10,
    marginBottom: 10,
  },
  cardInfo: {
    width: "100%",
    alignItems: "center",
  },
  cardName: {
    fontSize: 12, 
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },
  cardVersion: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
    textAlign: "center",
  },
  cardNumber: {
    fontSize: 12,
    color: "#888",
    marginBottom: 2,
  },
  cardRarity: {
    fontSize: 12,
    color: "#444",
    fontWeight: "500",
  },
  listContainer: {
    width: "100%",
    paddingHorizontal: 10,
  },
  row: {
    justifyContent: "space-between",
    width: "100%",
  },
});
