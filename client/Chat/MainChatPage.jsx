import React, { useState, useEffect } from 'react';
import { ImageBackground, StyleSheet, View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';


export default function MainChatPage(props) {
  const navigation = useNavigation();
  const urlGetAllChat = "http://proj.ruppin.ac.il/bgroup17/prod/api/Chat/GetChats/"
  const { user } = props.route.params
  const [allChats, setAllChats] = useState([]);
  
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
    //console.log('user in main chat: ', user)
    let tempArr = []
       fetch(urlGetAllChat + user.id, {
        method: 'GET',
        headers: new Headers({
          'Content-Type': 'application/json; charset=UTF-8',
          'Accept': 'application/json; charset=UTF-8',
        })
      })
        .then(res => {
          console.log('res.ok getChats=', res.ok);
          return res.json()
        })
        .then(chats => {
          //console.log('chats in main chat: ', chats)

          for (var i = 0; i < chats.length; i++) {
            tempArr.push(chats[i])
          }
          setAllChats(tempArr)
          //console.log('temp user in main chat: ', tempArr)
        },
          (error) => {
            console.log('Error', error);
          })
    });
    return unsubscribe;
  }, [navigation]);

  const getMessagesFirebase = (itemId, uploadUser, otherUser, item) => {
    if (uploadUser == user.id) {
      var itemRequestId = itemId + "-" + uploadUser + "-" + otherUser.id
    }
    else {
      var itemRequestId = itemId + "-" + uploadUser + "-" + user.id
    }

    var sendMessUser = user
    var userUploadItem = otherUser
    var UsersList = [];
    UsersList.push(sendMessUser, userUploadItem)

    var userChat = [{ UsersList, itemRequestId, item }]
    navigation.navigate('NewChat', { userChat: userChat, item: itemId })
  }


  const returnAllChats =
    allChats.map(user =>{
      return <ScrollView>
        <View key={user.id} style={styles.layout}>
          <TouchableOpacity onPress={() => getMessagesFirebase(user.itemId, user.uploadUser, user.userDTO[0], user.userDTO[0].UserItemsListDTO[0].itemsListDTO[0])}>
            <View style={{ paddingBottom: 7 }}>
              <View style={{ flexDirection: 'row' }}>
                <View style={{ flexDirection: 'column', paddingRight: 20 }}>
                  <Text style={styles.Text}>
                    {user.userDTO[0].firstName} {user.userDTO[0].lastName}
                  </Text>
                  <Text style={{}}>
                    {user.userDTO[0].UserItemsListDTO[0].itemsListDTO[0].name}
                  </Text>
                </View>
                <Image source={{ uri: user.userDTO[0].profilePicture }} style={styles.userImage} />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    })


  return (
    <ImageBackground source={require('../assets/bgImage1.png')} style={styles.image}>
      <View style={styles.container}>
        <View style={{ flexDirection: 'row' }}>
          <Image source={{ uri: user.profilePicture }} style={styles.userImage}></Image>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.userHeader}>{user.firstName} {user.lastName}</Text>
            <View style={{ flexDirection: 'row' }}>
              <MaterialCommunityIcons name="cash" color={"#7DA476"} size={20} />
              <Text style={styles.userHeader}>{user.numOfPoints}</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.line} />
      <ScrollView>
        <View>
          {returnAllChats}
        </View>
      </ScrollView>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  mainContent: {
    flex: 1,
  },
  image: {
    flex: 1,
    resizeMode: 'cover',
  },
  userHeader: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: 'bold',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center'
  },
  line: {
    marginLeft: 20,
    marginRight: 20,
    marginTop: 8,
    borderBottomColor: '#a7a7a7',
    borderBottomWidth: 1
  },
  Text: {
    fontSize: 17,
    color: "#000",
  },
  container: {
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 20,
    marginTop: 60,
    marginBottom: 10,
  },
  layout: {
    marginTop: 10,
    marginRight: 20,
    marginLeft: 20,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  userImage: {
    height: 60,
    width: 60,
    borderRadius: 50,
  },
  ball_img: {
    marginBottom: 90,
    height: 110,
    width: 100,
    alignSelf: 'center',
    top: 100
  },
  footer: {
    justifyContent: 'flex-end',
  },
  plusStyle: {
    margin: 5,
    height: 30,
    width: 30,
  },
  createNewTeam_btn: {
    flexDirection: "row-reverse",
    alignItems: 'center',
  },
  teamCard: {
    backgroundColor: '#D9D9D9',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: 30,
    width: '90%',
    height: 80,
    margin: 20,
    padding: 5,
  },
  contextSide: {
    flex: 1,
    padding: 10
  },
  headerCard_View: {
    alignSelf: 'center'
  },
  descripitionCard: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  }
});
