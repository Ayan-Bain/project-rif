import React, { useEffect } from 'react';
import { Modal, StatusBar, View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Alert, useColorScheme } from 'react-native';
import { useAuth } from './services/AuthHandler';
import { useData } from './services/RetrieveData';
import AccountStatus from './AccountStatus';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from './custom-components/CustomButton';
import AddSubscriptionForm from './partials/AddSubscriptionForm';
import Subscription from '../subscriptions/subsciption';
import renewalDate from './services/RenewalDate';
import { Colors } from './constants/Colors';
import MoreMenu from './partials/MoreMenu';

const HomeScreen: React.FC=  () => {
    const [selectedItem, setSelectedItem] = React.useState<Subscription | undefined>(undefined);
    const { isLoading, user,signIn} = useAuth();
    const [addSubscription, setAddSubscription] = React.useState<boolean>(false);
    const [menuVisible, setMenuVisible] = React.useState<boolean>(false);
    const [moreMenuVisible, setMoreMenuVisible] = React.useState<boolean>(false);
    const {data, retrieve, deleteSubscription, themeMode} = useData();
        const systemScheme = useColorScheme(); //
        const theme =
          Colors[themeMode === "system" ? systemScheme || "light" : themeMode];
      const activeTheme = themeMode === 'system' ? systemScheme : themeMode;
      const isDark = activeTheme === 'dark';

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
            <SafeAreaView style={[styles.container,{justifyContent: 'center', backgroundColor: theme.background}]}>
                <StatusBar barStyle="dark-content" />
                <ActivityIndicator size={100}/>
            </SafeAreaView>
        )
    }

    const openEdit = (item: Subscription) => {
      setSelectedItem(item);
      setAddSubscription(true);
    }

    const handleOptionsMenu = (item: Subscription) => {
          Alert.alert(
            "Confirm Delete",
            "Are you sure? This cannot be undone.",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Delete", style: "destructive", onPress: () => deleteSubscription(user.uid, item.id) }
            ]
          );
          style: "destructive" 
        }


    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "stretch",
            backgroundColor: theme.background,
            marginHorizontal: "3%",
          }}
        >
          <CustomButton
            iconName="menu-outline"
            backgroundColor={theme.background}
            iconSize={30}
            onPress={() => setMoreMenuVisible(true)}
          />
          <AccountStatus />
        </View>
        {user && (
          <View style={{ marginTop: "5%", flex: 1 }}>
            {data && data.length > 0 ? (
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
                          setAddSubscription(true);
                        }}
                        backgroundColor="#238737"
                      />
                    </View>

                    <View style={styles.rowContainer}>
                      <Text
                        style={[
                          styles.headerColumn,
                          { flex: 2, color: theme.text },
                        ]}
                      >
                        Name
                      </Text>
                      <Text
                        style={[
                          styles.headerColumn,
                          { flex: 2.5, color: theme.text },
                        ]}
                      >
                        Renewal date
                      </Text>
                      <Text
                        style={[
                          styles.headerColumn,
                          { flex: 1.5, color: theme.text },
                        ]}
                      >
                        Cycle
                      </Text>
                      <Text
                        style={[
                          styles.headerColumn,
                          { flex: 2, color: theme.text },
                        ]}
                      >
                        Price
                      </Text>
                      <View style={{ flex: 0.7 }} />
                    </View>
                  </View>
                }
                renderItem={({ item, index }) => (
                  <View
                    style={[
                      styles.rowContainer,
                      {
                        backgroundColor:
                          index % 2 == 0
                            ? "transparent"
                            : theme.whiteBackground,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.cellText, { flex: 2, color: theme.text }]}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={[
                        styles.cellText,
                        { flex: 2.5, color: theme.text },
                      ]}
                    >
                      {renewalDate(item.date, item.cycle)}
                    </Text>
                    <Text
                      style={[
                        styles.cellText,
                        { flex: 1.5, color: theme.text },
                      ]}
                    >
                      {item.cycle.charAt(0).toUpperCase() + item.cycle.slice(1)}
                    </Text>
                    <Text
                      style={[styles.cellText, { flex: 2, color: theme.text }]}
                    >
                      {item.price}
                    </Text>
                    <View
                      style={{
                        flex: 0.7,
                        marginRight: 10,
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedItem(item);
                          setMenuVisible(true);
                        }}
                        style={{ padding: 5 }}
                      >
                        <Ionicons
                          name="ellipsis-vertical"
                          size={25}
                          color={isDark ? "#FFFFFF" : "#555"}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
            ) : (
              <View style={{ flex: 1 }}>
                <View
                  style={[
                    styles.buttonWrapper,
                    { justifyContent: "flex-start" },
                  ]}
                >
                  <CustomButton
                    title="Add Subscription"
                    onPress={() => {
                      setSelectedItem(undefined);
                      setAddSubscription(true);
                    }}
                    backgroundColor="#238636"
                  />
                </View>
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    marginBottom: "25%",
                    paddingHorizontal: "10%",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 30,
                      textAlign: "center",
                      lineHeight: 50,
                      color: theme.text,
                    }}
                  >
                    You do not have any subscriptions added yet!
                  </Text>
                </View>
              </View>
            )}
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
            <View style={{ height: "70%" }}>
              <AddSubscriptionForm
                editingItem={selectedItem}
                onComplete={() => {
                  setAddSubscription(false);
                  setSelectedItem(undefined);
                }}
              />
            </View>
          </View>
        </Modal>

        <Modal visible={menuVisible} transparent={true} animationType="fade">
          {/* Transparent overlay to close menu when clicking outside */}
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setMenuVisible(false)}
          >
            <View style={styles.overflowMenu}>
              <Text
                style={[
                  styles.menuText,
                  { textAlign: "center", fontWeight: "bold", fontSize: 20 },
                ]}
              >
                {selectedItem?.name}
              </Text>
              <TouchableOpacity
                style={styles.menuOption}
                onPress={() => {
                  setMenuVisible(false);
                  if (selectedItem) openEdit(selectedItem);
                }}
              >
                <Ionicons name="create-outline" size={20} color="green" />
                <Text style={styles.menuText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuOption, { borderBottomWidth: 0 }]}
                onPress={() => {
                  setMenuVisible(false);
                  if (selectedItem) handleOptionsMenu(selectedItem);
                }}
              >
                <Ionicons name="trash-outline" size={20} color="red" />
                <Text style={[styles.menuText, { color: "red" }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        <MoreMenu visible={moreMenuVisible} setVisible={setMoreMenuVisible}/>
        
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
    paddingHorizontal: '2%',
    paddingVertical: 12,
    // borderBottomWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center'
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)', // Dim the background slightly
    justifyContent: 'center',
    alignItems: 'center',
  },
  overflowMenu: {
    width: 150,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 5,
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Elevation for Android
    elevation: 5,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuText: {
    fontSize: 18,
    marginLeft: 10,
  }
});
export default HomeScreen;