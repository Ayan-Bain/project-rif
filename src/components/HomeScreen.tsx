import React, { useEffect, useMemo } from 'react';
import { Modal, StatusBar, View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Alert, useColorScheme, Image, useWindowDimensions } from 'react-native';
import {useFonts} from 'expo-font'
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
import UniversalLogoHandler from './partials/UniversalLogoHandler';

const HomeScreen: React.FC=  () => {
    const [selectedItem, setSelectedItem] = React.useState<Subscription | undefined>(undefined);
    const { isLoading, user,signIn} = useAuth();
    const [addSubscription, setAddSubscription] = React.useState<boolean>(false);
    const [menuVisible, setMenuVisible] = React.useState<boolean>(false);
    const [details, setDetails] = React.useState<boolean>(false);
    const [selectedId, setSelectedId] = React.useState<Subscription | null>(null);
    const [moreMenuVisible, setMoreMenuVisible] = React.useState<boolean>(false);
    const {data, retrieve, deleteSubscription, themeMode, update} = useData();
        const systemScheme = useColorScheme();
        const theme =
          Colors[themeMode === "system" ? systemScheme || "light" : themeMode];
      const activeTheme = themeMode === 'system' ? systemScheme : themeMode;
      const isDark = activeTheme === 'dark';

      const [fontsLoaded] = useFonts({
        'Berkshire': require('../../assets/fonts/Berkshire_Swash/BerkshireSwash-Regular.ttf'),
        'Acme': require('../../assets/fonts/Acme/Acme-Regular.ttf'),
        'Bree': require('../../assets/fonts/Bree_Serif/BreeSerif-Regular.ttf'),
        'Amaranth': require('../../assets/fonts/Amaranth/Amaranth-Bold.ttf'),
        'Caveat': require('../../assets/fonts/Caveat/static/Caveat-Medium.ttf'),
        'Crete': require('../../assets/fonts/Crete_Round/CreteRound-Italic.ttf'),
        'Garamond': require('../../assets/fonts/EB_Garamond/static/EBGaramond-Regular.ttf'),
        'Exo': require('../../assets/fonts/Exo_2/static/Exo2-MediumItalic.ttf')
      })

    useEffect(()=> {
      setSelectedItem(undefined);
      if(user) {
        retrieve(user.uid);
      }
      else {
        retrieve(null);
      }
    },[user])

    
    const sortedData = useMemo(() => {
      if(!data) return;
      return [...data].sort((a, b) => {
        return new Date(renewalDate(a.date, a.cycle)).getTime() - new Date(renewalDate(b.date, b.cycle)).getTime();
        });
      }, [data]);
      if(isLoading) {
        return(
          <SafeAreaView style={[styles.container,{justifyContent: 'center', backgroundColor: theme.background}]}>
                <StatusBar barStyle="dark-content" />
                <ActivityIndicator size={100}/>
            </SafeAreaView>
        )
      };
      
      if(!fontsLoaded) {
        return (
          <View style={{backgroundColor: theme.background, justifyContent: 'center'}}>
            <ActivityIndicator size={100}/>
          </View>
        )
      }
      const isOverdue = (date: string): boolean => {
        return (new Date(date).getTime() < new Date().setHours(0,0,0,0));
      }
      
      const openEdit = (item: Subscription) => {
        setSelectedItem(item);
        setAddSubscription(true);
    }

  const onMarkPaid = async (sub: Subscription) => {
    console.log("Marking as paid:", sub.name);

    const nextDate = renewalDate(sub.date, sub.cycle);
    const updatedSub = { ...sub, date: nextDate };

    const partial = {
      name: sub.name,
      price: sub.price,
      cycle: sub.cycle,
      date: nextDate,
    };

    try {
      await update(user.uid, sub.id, partial);
      Alert.alert(
        "Success",
        `${sub.name} marked as paid. Next renewal: ${nextDate}`
      );
    } catch (error) {
      console.error("Update failed:", error);
      Alert.alert("Error", "Could not update subscription.");
    }
  };

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
            color={isDark ? null : "black"}
            onPress={() => setMoreMenuVisible(true)}
          />
          <AccountStatus />
        </View>
        {user && (
          <View style={{ marginTop: "5%", flex: 1 }}>
            {data && data.length > 0 ? (
              <FlatList
                data={sortedData}
                ListHeaderComponent={
                  <View style={styles.tableContainer}>
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
                        Renewal Date
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
                        Price (Rs.)
                      </Text>
                      <Text
                        style={[styles.headerColumn, { color: theme.text, flex: 2.5 }]}
                      >
                        Accessibility
                      </Text>
                    </View>
                  </View>
                }
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    onPress={() => {
                      setDetails(true);
                      setSelectedId(item);
                    }}
                  >
                    <View
                      style={[
                        styles.rowContainer,
                        {
                          backgroundColor:
                            index % 2 == 0
                              ? "transparent"
                              : theme.whiteBackground,
                          borderColor: isOverdue(
                            renewalDate(item.date, item.cycle)
                          )
                            ? "red"
                            : null,
                          borderWidth: isOverdue(
                            renewalDate(item.date, item.cycle)
                          )
                            ? 1
                            : 0,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.cellText,
                          { flex: 2, color: theme.text, fontFamily: 'Acme' },
                        ]}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                      <Text
                        style={[
                          styles.cellText,
                          { flex: 2.5, color: theme.text, fontFamily: 'Crete' },
                        ]}
                      >
                        {renewalDate(item.date, item.cycle)}
                      </Text>
                      <Text
                        style={[
                          styles.cellText,
                          {
                            flex: 1.5,
                            color: theme.text,
                            fontSize: 14,
                            marginLeft: 10,
                            fontFamily: 'Bree'
                          },
                        ]}
                      >
                        {item.cycle.charAt(0).toUpperCase() +
                          item.cycle.slice(1)}
                      </Text>
                      <Text
                        style={[
                          styles.cellText,
                          { flex: 2, color: theme.text, fontFamily: 'Exo' },
                        ]}
                      >
                        {item.price}
                      </Text>
                      <View
                        style={{
                          flex: 1.5,
                          marginRight: 30,
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => {
                            onMarkPaid(item);
                          }}
                          style={{
                            padding: 0,
                            alignItems: "center",
                            marginRight: 10,
                          }}
                        >
                          <Ionicons
                            name="checkmark"
                            size={25}
                            color={isDark ? "#FFFFFF" : "#555"}
                          />
                          <Text
                            style={{
                              fontSize: 12,
                              textAlign: "center",
                              color: theme.text,
                              fontFamily: 'Garamond',
                            }}
                          >
                            Mark as Paid
                          </Text>
                        </TouchableOpacity>
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
                  </TouchableOpacity>
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

        <Modal
          visible={details}
          onRequestClose={() => {
            setDetails(false);
            setSelectedId(null);
          }}
          animationType="fade"
          transparent={true}
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
              onPress={() => {
                setDetails(false);
                setSelectedId(null);
              }}
            ></TouchableOpacity>
            <View
              style={{
                height: "70%",
                backgroundColor: !isDark
                  ? theme.whiteBackground
                  : theme.background,
                paddingTop: "10%",
                alignItems: "center",
                paddingHorizontal: '5%'
              }}
            >
              <View style={{ backgroundColor: "white", borderRadius: 20 }}>
                <UniversalLogoHandler
                  uri={selectedId?.logo}
                  alt={selectedId?.name}
                />
              </View>
              <View
                style={{
                  paddingTop: 30,
                  padding: 10,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: "100%",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: theme.text,
                    textAlign: "center",
                    fontSize: 25,
                    fontFamily: 'Amaranth'
                  }}
                >
                  Subscription Name:
                </Text>
                <Text
                  style={{
                    color: theme.text,
                    textAlign: "center",
                    fontSize: 35,
                    letterSpacing: 3,
                    fontFamily: 'Caveat'
                  }}
                >
                  {selectedId?.name}
                </Text>
              </View>
              <View
                style={{
                  padding: 10,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: "100%",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: theme.text,
                    textAlign: "center",
                    fontSize: 20,
                    fontFamily: 'Amaranth'
                  }}
                >
                  Last Paid Date:
                </Text>
                <Text
                  style={{
                    color: theme.text,
                    textAlign: "center",
                    fontSize: 30,
                    fontFamily: 'Caveat'
                  }}
                >
                  {selectedId?.date}
                </Text>
              </View>
              <View
                style={{
                  padding: 10,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: "100%",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: theme.text,
                    textAlign: "center",
                    fontSize: 20,
                    fontFamily: 'Amaranth'
                  }}
                >
                  Subscription Renewal Cycle:
                </Text>
                <Text
                  style={{
                    color: theme.text,
                    textAlign: "center",
                    fontSize: 30,
                    fontFamily: 'Caveat'
                  }}
                >
                  {selectedId?.cycle.charAt(0).toUpperCase() +
                    selectedId?.cycle.slice(1)}
                </Text>
              </View>
              <View
                style={{
                  padding: 15,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: "100%",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: theme.text,
                    textAlign: "center",
                    fontSize: 20,
                    fontFamily: 'Amaranth'
                  }}
                >
                  Subscription Price:
                </Text>
                <Text
                  style={{
                    color: theme.text,
                    textAlign: "center",
                    fontSize: 30,
                    fontFamily: 'Caveat'
                  }}
                >
                  ₹{selectedId?.price}
                </Text>
              </View>
              <View
                style={{
                  padding: 15,
                  justifyContent: "space-between",
                  width: "100%",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: theme.text,
                    textAlign: "center",
                    fontSize: 25,
                    fontFamily: 'Amaranth'
                  }}
                >
                  Subscription Category:
                </Text>
                <Text
                  style={{
                    color: theme.text,
                    textAlign: "center",
                    fontSize: 35,
                    paddingTop: 15,
                    fontFamily: 'Caveat'
                  }}
                >
                  {selectedId?.category
                    .replaceAll("-", " ")
                    .charAt(0)
                    .toUpperCase() +
                    selectedId?.category.replaceAll("-", " ").slice(1)}
                </Text>
              </View>
              <CustomButton
                title="Mark as Paid"
                backgroundColor="green"
                onPress={() => onMarkPaid(selectedId)}
              />
            </View>
          </View>
        </Modal>

        <MoreMenu visible={moreMenuVisible} setVisible={setMoreMenuVisible} />
      </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tableContainer: {
    width: '100%',
  },
  buttonWrapper: {
    alignItems: "flex-end",
    paddingRight: "5%",
    marginVertical: 10,
  },
  rowContainer: {
    flexDirection: "row",
    paddingHorizontal: '2%',
    paddingVertical: 12,
    borderColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerColumn: {
    fontFamily: 'Berkshire',
    fontSize: 18,
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
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overflowMenu: {
    width: 150,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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