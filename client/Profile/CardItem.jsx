import React from 'react'
import { ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { firebase } from "../firebase"
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function CardItem(props) {
  const urlPostChat = "http://proj.ruppin.ac.il/bgroup17/prod/api/Chat/PostChat";
  const navigation = useNavigation();

  function createUsersArr() {
    var sendMessUser = props.logInUser
    var userUploadItem = props.user
    var itemRequestId = props.data.itemId + "-" + props.user.id + "-" + props.logInUser.id
    var UsersList = [];
    UsersList.push(sendMessUser, userUploadItem)
    var item = props.data
    var userChat = [{ UsersList, itemRequestId, item }]
    requestItem(userChat)
  }

  function requestItem(userChat) {
    var date = new Date().getDate();
    var month = new Date().getMonth() + 1;
    var year = new Date().getFullYear();
    var fullDate = year + "-" + month + "-" + date

    let chatRow = {
      requestUser: userChat[0].UsersList[0].id,
      uploadUser: userChat[0].UsersList[1].id,
      itemId: userChat[0].item.itemId,
      lastMessageDate: fullDate
    }
    fetch(urlPostChat, {
      method: 'POST',
      body: JSON.stringify(chatRow),
      headers: new Headers({
        'Content-Type': 'application/json; charset=UTF-8',
        'Accept': 'application/json; charset=UTF-8',
      })
    })
      .then(res => {
        console.log('res.ok postChat=', res.ok);
        return res.json()
      })
      .then(i => {
        console.log(i)
      },
        (error) => {
          console.log('Error', error);
        })
    sendDfaultMessage(userChat)
    navigation.navigate('NewChat', { userChat: userChat, item: props.data })
  }

  function sendDfaultMessage(userChat) {
    let Dmessage = `${userChat[0].UsersList[0].firstName} רוצה לקבל ממך את הפריט: ${'\n' + userChat[0].item.name}`;

    const messageId = userChat[0].itemRequestId;
    if (Dmessage.length > 0) {
      let msgId = firebase.database().ref('messages').child(userChat[0].itemRequestId).push().key;

      let updates = {};
      let message = {
        message: Dmessage,
        time: firebase.database.ServerValue.TIMESTAMP,
        from: userChat[0].UsersList[0]
      }
      updates['messages/' + messageId + '/' + msgId] = message;

      sendPushNotification(props.user.userToken, Dmessage)
      firebase.database().ref().update(updates)
    }
  }
  async function sendPushNotification(expoPushToken, Dmessage) {
    var sendMessUser = props.logInUser
    var userUploadItem = props.user
    var itemRequestId = props.data.itemId + "-" + props.user.id + "-" + props.logInUser.id
    var UsersList = [];
    UsersList.push(userUploadItem, sendMessUser)
    var item = props.data
    var userChat = [{ UsersList, itemRequestId, item }]

    const message = {
      to: expoPushToken,
      sound: 'default',
      title: 'בקשת פריט חדשה',
      body: Dmessage,
      data: { type: "requestMessage", from: userChat, item: props.data }
    };

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
  }
  return (
    <ScrollView>
      <View style={styles.layout}>
        <View style={styles.header}>
          <View>
          <Text style={{ fontWeight: "bold" }}>{props.data.name}</Text>
          <View style={styles.header2}>
            <Text>{props.data.priceList[0].name}  |  {props.data.numberOfPoints}</Text>
            <MaterialCommunityIcons name="cash" color={"#7DA476"} size={20} />
          </View></View>
          <View style={{ flex: 1 }}>
            <TouchableOpacity style={styles.requestBtn} onPress={createUsersArr}>
              <Text style={styles.btnText}>בקשת פריט</Text>
            </TouchableOpacity>
          </View>
        </View>
        {props.data.description ?
          <Text style={{ marginRight: 10, marginLeft: 10 }}>{props.data.description}</Text> : null}
      </View>

      <View style={{ height: 270, flexDirection: 'row', justifyContent: 'center', marginTop: 15 }} >
        {props.data.image1 &&
          <Image source={{ uri: props.data.image1 }} style={{ height: 270, width: 200, borderColor: '#fff', borderWidth: 2 }}></Image>}

        <View>
          {props.data.image2 ?
            <Image source={{ uri: props.data.image2 }} style={{ height: 90, width: 100, borderColor: '#fff', borderWidth: 2 }}></Image> : null}

          {props.data.image3 ?
            <Image source={{ uri: props.data.image3 }} style={{ height: 90, width: 100, borderColor: '#fff', borderWidth: 2 }}></Image> : null}

          {props.data.image4 ?
            <Image source={{ uri: props.data.image4 }} style={{ height: 90, width: 100, borderColor: '#fff', borderWidth: 2 }}></Image> : null}
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={{ fontWeight: "bold" }}>{props.data.conditionList[0].condition}  |  </Text>
        <Text style={{ fontWeight: "bold" }}>{props.data.sizeList[0].size}  </Text>
      </View>
      <View style={styles.line} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row-reverse',
    marginTop: 35,
    marginBottom: 10,
    marginRight: 10,
    marginLeft: 10
  },
  header2: {
    flexDirection: 'row-reverse',
    marginBottom: 5,
    justifyContent: 'flex-end',
    alignItems: 'flex-end'
  },
  footer: {
    flexDirection: 'row-reverse',
    marginLeft: 32,
  },
  layout: {
    marginRight: 20,
    marginLeft: 20,
    justifyContent: 'flex-end',
    alignItems: 'flex-end'
  },
  line: {
    marginLeft: 20,
    marginRight: 20,
    marginTop: 20,
    marginBottom: 5,
    borderBottomColor: '#a7a7a7',
    borderBottomWidth: 1
  },
  requestBtn: {
    width: 90,
    backgroundColor: "#9d76a5",
    borderRadius: 10,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    color: "white",
    fontSize: 14,
    fontWeight: '500'
  },
})
