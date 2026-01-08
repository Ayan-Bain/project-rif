import React, { useEffect } from 'react';
import { Modal, StatusBar, View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { useAuth } from './services/AuthHandler';
import { useData } from './services/RetrieveData';
import AccountStatus from './AccountStatus';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from './custom-components/CustomButton';
import AddSubscriptionForm from './partials/AddSubscriptionForm';
import Subscription from '../subscriptions/subsciption';

const HomeScreen: React.FC=  () => {
    const [selectedItem, setSelectedItem] = React.useState<Subscription | undefined>(undefined);
    const { isLoading, user,signIn} = useAuth();
    const [addSubscription, setAddSubscription] = React.useState<boolean>(false);
    const {data, retrieve} = useData();
    
    useEffect(()=> {
      setSelectedItem(undefined);
      if(user) {
        retrieve(user.uid);
      }
      else {
        retrieve(null);
      }
    },[user])
    if(isLoading) {
        return(
            <SafeAreaView style={[styles.container,{justifyContent: 'center'}]}>
                <StatusBar barStyle="dark-content" />
                <ActivityIndicator size={100}/>
            </SafeAreaView>
        )
    }

    const openEdit = (item: Subscription) => {
      setSelectedItem(item);
      setAddSubscription(true);
    }

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View
          style={{
            justifyContent: "flex-start",
            alignItems: "flex-end",
            marginRight: "2%",
          }}
        >
          <AccountStatus />
        </View>
        {user && (
          <View style={{ marginTop: "5%" }}>
            <FlatList
  data={data}
  // keyExtractor={(item) => item.id}
  ListHeaderComponent={
    <View style={styles.tableContainer}>
      {/* Action Button */}
      <View style={styles.buttonWrapper}>
        <CustomButton
          title="Add Subscription"
          onPress={() => {
            setSelectedItem(undefined);
            setAddSubscription(true)}
          }
          backgroundColor='blue'
        />
      </View>

      <View style={styles.rowContainer}>
        <Text style={[styles.headerColumn, { flex: 2 }]}>Name</Text>
        <Text style={[styles.headerColumn, { flex: 1 }]}>Price</Text>
        <Text style={[styles.headerColumn, { flex: 2 }]}>Last paid date</Text>
        <Text style={[styles.headerColumn, { flex: 2 }]}>Cycle</Text>
        <View style={{ flex: 1 }} />
      </View>
    </View>
  }
  renderItem={({ item }) => (
    <View style={styles.rowContainer}>
      <Text style={[styles.cellText, { flex: 2 }]}>{item.name}</Text>
      <Text style={[styles.cellText, { flex: 1 }]}>{item.price}</Text>
      <Text style={[styles.cellText, { flex: 2 }]}>{item.date}</Text>
      <Text style={[styles.cellText, { flex: 2 }]}>{item.cycle.charAt(0).toUpperCase()+item.cycle.slice(1)}</Text>
      <View style={{ flex: 1, marginRight: 10 }}>
        <CustomButton title='Edit' backgroundColor='green' onPress={()=>openEdit(item)}/>
      </View>
    </View>
  )}
/>
          </View>
        )}
        {!user && (
          <View
            style={{ justifyContent: "center", flex: 1, alignItems: "center" }}
          >
            <CustomButton
              title="Sign in with Google"
              onPress={() => signIn()}
              backgroundColor="purple"
            />
          </View>
        )}

        <Modal
          onRequestClose={() => setAddSubscription(false)}
          visible={addSubscription}
          transparent={true}
          animationType="slide"
        >
          <View
            style={{
              flex: 1,
              justifyContent: "flex-end",
              backgroundColor: "rgba(0,0,0,0.3)",
            }}
          >
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => setAddSubscription(false)}
            ></TouchableOpacity>
            <View style={{ height: "70%", backgroundColor: "white" }}>
              <AddSubscriptionForm editingItem={selectedItem} onComplete={()=> {
                setAddSubscription(false);
                setSelectedItem(undefined);
              }}/>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // justifyContent: 'center',
        // alignItems: 'center',
    },
    tableContainer: {
    width: '100%',
  },
  buttonWrapper: {
    alignItems: "flex-end",
    paddingRight: "5%",
    marginVertical: 10,
  },
  // This shared style is the secret to perfect alignment
  rowContainer: {
    flexDirection: "row",
    width: '100%',
    // paddingHorizontal: 10,
    paddingVertical: 12,
    // borderBottomWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
  },
  headerColumn: {
    fontWeight: 'bold',
    fontSize: 20, // Reduced from 24 to prevent overlap on smaller screens
    textAlign: 'center',
    color: '#333',
  },
  cellText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#555',
  }
});
export default HomeScreen;