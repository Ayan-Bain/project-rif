import React from "react";
import { View, Text, Modal, TouchableOpacity, useColorScheme, Switch, StyleSheet } from "react-native";
import { Colors } from "../constants/Colors";
import { useData } from "../services/RetrieveData";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../services/AuthHandler";
interface props  {
    visible?: boolean;
    setVisible?: (val: boolean) => void;
}

const MoreMenu: React.FC<props> = ({visible, setVisible}) => {
    const {user} = useAuth();
    const {themeMode, toggleTheme, isCloudSyncOn, setCloudSyncOn, days, setDays} = useData();

    const systemScheme = useColorScheme(); //
            const theme =
              Colors[
                themeMode === "system" ? systemScheme || "light" : themeMode
              ];

    const activeTheme = themeMode === 'system' ? systemScheme : themeMode;
  const isDark = activeTheme === "dark";

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        onRequestClose={() => setVisible(false)}
      >
        <View
          style={{
            flexDirection: "row-reverse",
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.3)",
          }}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => setVisible(false)}
          ></TouchableOpacity>
          <View
            style={{
              width: "70%",
              backgroundColor: theme.whiteBackground,
              paddingTop: "20%",
              justifyContent: 'space-between'
            }}
          >
            <View>
              <Text
                style={{ color: theme.text, textAlign: "center", fontSize: 20 }}
              >
                {user?'Welcome,':null}{user?.displayName}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  marginTop: 50,
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                  paddingHorizontal: 20,
                }}
              >
                <Text style={{ fontSize: 22, color: theme.text }}>
                  Toggle Cloud Sync
                </Text>
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
                  // width: "100%",
                  paddingHorizontal: 20,
                }}
              >
                <Text
                  style={[styles.userText, { color: isDark ? "#fff" : "#000" }]}
                >
                  Theme Preference
                </Text>

                <View
                  style={[
                    styles.themeToggleRow,
                    {
                      backgroundColor: isDark
                        ? theme.background
                        : styles.themeToggleRow.backgroundColor,
                    },
                  ]}
                >
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
              <View
                style={{
                  flexDirection: "row",
                  marginTop: 50,
                  justifyContent: "space-between",
                  // width: "100%",
                  paddingHorizontal: 20,
                }}
              >
                <Text
                  style={[styles.userText, { color: isDark ? "#fff" : "#000" }]}
                >
                  Days before alert
                </Text>

                <View
                  style={[
                    styles.themeToggleRow,
                    {
                      backgroundColor: isDark
                        ? theme.background
                        : styles.themeToggleRow.backgroundColor,
                    },
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => setDays(3)}
                    style={[
                      styles.iconBtn,
                      days===3 && styles.activeBtn,
                    ]}
                  >
                    <Text style={{color: themeMode === "light" ? "#2196F3" : "#888"}}>3</Text>
                  </TouchableOpacity>

                  {/* Dark Mode Button */}
                  <TouchableOpacity
                    onPress={() => setDays(5)}
                    style={[
                      styles.iconBtn,
                      days===5 && styles.activeBtn,
                    ]}
                  >
                    <Text style={{color: themeMode === "light" ? "#2196F3" : "#888"}}>5</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setDays(7)}
                    style={[
                      styles.iconBtn,
                      days===7 && styles.activeBtn,
                    ]}
                  >
                    <Text style={{color: themeMode === "light" ? "#2196F3" : "#888"}}>7</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View>
                <Text style={{color: theme.text, textAlign: 'center', fontWeight:'600', fontSize: 16}}>Developer Contact Information</Text>
                <Text style={{color: theme.text, textAlign: 'center', paddingBottom: '15%', fontWeight:'400'}}>ayanbain07@gmail.com</Text>
                <Text style={{color: theme.text, textAlign: 'center', paddingBottom: '30%', fontWeight:'600', fontSize: 16}}>{`\u00A9 Ayan & Co. All rights reserved.`}</Text>
            </View>
          </View>
        </View>
      </Modal>
    );

}


export default MoreMenu;


const styles = StyleSheet.create({
    themeToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    borderRadius: 20,
    padding: 2,
    // marginTop: 10,
    width: 120,
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
    fontSize: 18,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 4
  }
})