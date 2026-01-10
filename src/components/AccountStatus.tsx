import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, Modal, TouchableOpacity, Switch, useColorScheme } from 'react-native';
import { useAuth } from './services/AuthHandler';
import CustomButton from './custom-components/CustomButton';
import { useData } from './services/RetrieveData';
import { Colors } from './constants/Colors';

const AccountStatus: React.FC=  () => {
    const [modalVisible, setModalVisible] = React.useState<boolean>(false);
    const {user, isLoading, signIn, signOut} = useAuth();
    const {download, themeMode, data} = useData();

    const systemScheme = useColorScheme(); //
    const theme = Colors[themeMode === 'system' ? (systemScheme || 'light') : themeMode];

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
            style={{ alignItems: "center", marginRight: 10 }}
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
                    <Text
                      style={{
                        marginBottom: 10,
                        fontSize: 18,
                        color: theme.text,
                      }}
                    >
                      Welcome, {user.displayName}
                    </Text>
                    <Text
                      style={{
                        marginBottom: 10,
                        fontSize: 18,
                        color: theme.text,
                      }}
                    >
                      Email ID: {user.email}
                    </Text>
                    <Text style={{color: theme.text, marginBottom: 10, fontSize: 18}}>
                      Number of active subscription{data.length>1?'s':null}: {data.length}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "column",
                      paddingBottom: ".1%",
                    }}
                  >
                    <CustomButton
                      title="Download from Cloud"
                      onPress={() => download(user.uid)}
                      backgroundColor="#238737"
                    />
                    <View style={{ height: "10%" }}></View>
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
});
export default AccountStatus;