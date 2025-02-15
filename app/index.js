import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  FlatList 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Home() {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch('http://172.20.10.2/api/sets') 
      .then(response => {
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des données');
        }
        return response.json();
      })
      .then(data => setSets(data))
      .catch(error => setError(error.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#6A0DAD" style={styles.loader} />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explorer vos Collections</Text>
      
      <FlatList
        data={sets}
        numColumns={2}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => router.push(`/cardList?id=${item.id}`)}
          >
            <View style={styles.numberContainer}>
              <Text style={styles.number}>{index + 1}</Text>
            </View>
            <Text style={styles.cardTitle}>{item.name}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
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
  loader: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  error: { 
    color: 'red', 
    fontSize: 16, 
    textAlign: 'center' 
  },
  title: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 20, 
    color: '#333' 
  },
  listContent: { 
    paddingHorizontal: 10 
  },
  card: {
    flex: 1,
    margin: 10,
    backgroundColor: '#A45DBA',
    borderRadius: 15,
    elevation: 4, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  numberContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  number: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#6A0DAD' 
  },
  cardTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    textAlign: 'center', 
    color: '#fff' 
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

