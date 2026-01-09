import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, Modal, TouchableOpacity, Switch, useColorScheme } from 'react-native';
import { useAuth } from './services/AuthHandler';
import CustomButton from './custom-components/CustomButton';
import { useData } from './services/RetrieveData';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from './constants/Colors';

const AccountStatus: React.FC=  () => {
    const [modalVisible, setModalVisible] = React.useState<boolean>(false);
    const {user, isLoading, signIn, signOut} = useAuth();
    const {isCloudSyncOn,setCloudSyncOn, download, toggleTheme, themeMode} = useData();

    const systemScheme = useColorScheme(); //
    const theme = Colors[themeMode === 'system' ? (systemScheme || 'light') : themeMode];
  
  // Determine actual theme based on selection
  const activeTheme = themeMode === 'system' ? systemScheme : themeMode;
  const isDark = activeTheme === 'dark';

if(isLoading) {
    return(
        <View style={[styles.container, {backgroundColor: theme.background}]}>
            <ActivityIndicator size={50}/>
        </View>
    )
}
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {!user && (
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={{ alignItems: "flex-end", marginRight: 10 }}
          >
            <Image
              source={{
                uri: "https://www.shutterstock.com/image-vector/unknown-person-hidden-covered-masked-600nw-1552977773.jpg",
              }}
              style={{ width: 50, height: 50, borderRadius: 25 }}
            />
          </TouchableOpacity>
        )}
        {user && (
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={{ alignItems: "flex-end", marginRight: 10 }}
          >
            <Image
              source={{ uri: user.photoURL }}
              style={{ width: 50, height: 50, borderRadius: 25 }}
            />
            <Text style={{ fontSize: 14, marginTop: 5, color: theme.text }}>
              {user.displayName}
            </Text>
          </TouchableOpacity>
        )}

        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.3)",
              justifyContent: "flex-end",
              //   alignItems: "center",
            }}
          >
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{ flex: 1 }}
            ></TouchableOpacity>
            <View
              style={{ height: "60%", backgroundColor: theme.whiteBackground }}
            >
              {!user && (
                <View style={{ alignItems: "center", marginTop: 20 }}>
                  <Image
                    source={{
                      uri: "https://www.shutterstock.com/image-vector/unknown-person-hidden-covered-masked-600nw-1552977773.jpg",
                    }}
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 50,
                      marginBottom: 20,
                    }}
                  />
                  <CustomButton
                    title="Sign in with Google"
                    onPress={() => signIn()}
                    backgroundColor="purple"
                  />
                </View>
              )}
              {user && (
                <View
                  style={{
                    alignItems: "center",
                    marginTop: 20,
                    flex: 1,
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ alignItems: "center" }}>
                    <Image
                      source={{ uri: user.photoURL }}
                      style={{ width: 100, height: 100, borderRadius: 50 }}
                    />
                    <Text style={{ marginBottom: 10, fontSize: 18, color: theme.text }}>
                      Welcome, {user.displayName}
                    </Text>
                    <Text style={{ marginBottom: 10, fontSize: 18, color: theme.text }}>
                      Email ID: {user.email}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        marginTop: 50,
                        justifyContent: "space-between",
                        width: "100%",
                        paddingHorizontal: 20,
                      }}
                    >
                      <Text style={{ fontSize: 22, color: theme.text }}>Toggle Cloud Sync</Text>
                      <Switch
                        trackColor={{ false: "#767577", true: "#81b0ff" }} // Colors for the "track"
                        thumbColor={isCloudSyncOn ? "#2196F3" : "#f4f3f4"} // Color for the moving "circle"
                        onValueChange={() => setCloudSyncOn(!isCloudSyncOn)} // Toggles the state
                        value={isCloudSyncOn}
                      />
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        marginTop: 50,
                        justifyContent: "space-between",
                        width: "100%",
                        paddingHorizontal: 20,
                      }}
                    >
                      <Text
                        style={[
                          styles.userText,
                          { color: isDark ? "#fff" : "#000" },
                        ]}
                      >
                        Theme Preference
                      </Text>

                      <View style={[styles.themeToggleRow,{backgroundColor: isDark?theme.background:styles.themeToggleRow.backgroundColor}]}>
                        {/* Light Mode Button */}
                        <TouchableOpacity
                          onPress={() => toggleTheme("light")}
                          style={[
                            styles.iconBtn,
                            themeMode === "light" && styles.activeBtn,
                          ]}
                        >
                          <Ionicons
                            name="sunny"
                            size={20}
                            color={themeMode === "light" ? "#2196F3" : "#888"}
                          />
                        </TouchableOpacity>

                        {/* Dark Mode Button */}
                        <TouchableOpacity
                          onPress={() => toggleTheme("dark")}
                          style={[
                            styles.iconBtn,
                            themeMode === "dark" && styles.activeBtn,
                          ]}
                        >
                          <Ionicons
                            name="moon"
                            size={20}
                            color={themeMode === "dark" ? "#2196F3" : "#888"}
                          />
                        </TouchableOpacity>

                        {/* System Default Button */}
                        <TouchableOpacity
                          onPress={() => toggleTheme("system")}
                          style={[
                            styles.iconBtn,
                            themeMode === "system" && styles.activeBtn,
                          ]}
                        >
                          <Ionicons
                            name="settings-outline"
                            size={20}
                            color={themeMode === "system" ? "#2196F3" : "#888"}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                  <View
                    style={{
                      flexDirection: "column",
                      paddingBottom: ".1%",
                    }}
                  >
                    {/* <CustomButton
                      title={
                        isCloudSyncOn
                          ? "Toggle Auto Sync OFF"
                          : "Toggle Auto Sync ON"
                      }
                      onPress={() => setCloudSyncOn(!isCloudSyncOn)}
                      backgroundColor={isCloudSyncOn ? "#4CAF50" : "#757575"}
                    /> */}

                    <CustomButton
                      title="Download from Cloud"
                      onPress={() => download(user.uid)}
                      backgroundColor="#238737"
                    />
                    <View style={{height: '10%'}}></View>
                    <CustomButton
                      title="Sign out"
                      onPress={() => signOut()}
                      backgroundColor="#c23030"
                    />
                  </View>
                </View>
              )}
            </View>
          </View>
        </Modal>
      </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
    },
    themeToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    borderRadius: 20,
    padding: 2,
    marginTop: 10,
    width: 150,
    justifyContent: 'space-between'
  },
  iconBtn: {
    padding: 8,
    borderRadius: 18,
    flex: 1,
    alignItems: 'center'
  },
  activeBtn: {
    backgroundColor: '#fff', // "Pops" out the active selection
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
  },
  userText: {
    fontSize: 14,
    fontWeight: '600'
  }
});
export default AccountStatus;