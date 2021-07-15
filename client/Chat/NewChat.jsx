import React from 'react'
import { Text, FlatList, View, SafeAreaView, TouchableOpacity, TextInput, StyleSheet, ScrollView, Image } from 'react-native'
import { firebase } from "../firebase"
import Icon from 'react-native-vector-icons/FontAwesome';
import { Dimensions } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { LogBox } from 'react-native';

const urlGetChatStatus = "http://proj.ruppin.ac.il/bgroup17/prod/api/Chat/GetChatDetails";
const urlPutChatStatus = "http://proj.ruppin.ac.il/bgroup17/prod/api/Chat/PutChatStatus";
const urlPutUploadConfirm = "http://proj.ruppin.ac.il/bgroup17/prod/api/Chat/PutUploadBtn";
const urlPutRequestConfirm = "http://proj.ruppin.ac.il/bgroup17/prod/api/Chat/PutRequestBtn";
const urlPutChatLastMesDate = "http://proj.ruppin.ac.il/bgroup17/prod/api/Chat/PutChatDate";
const window = Dimensions.get("window");
const screen = Dimensions.get("screen");
LogBox.ignoreLogs(['VirtualizedLists','Warning:...']);
LogBox.ignoreAllLogs();


export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      textMessage: "",
      userChat: this.props.route.params.userChat,
      messagesList: [],
      user1: this.props.route.params.userChat[0].UsersList[0], //loginUser
      user2Upload: this.props.route.params.userChat[0].UsersList[1], //otherUser
      item: this.props.route.params.userChat[0].item,
      itemIDFirebase: this.props.route.params.userChat[0].itemRequestId,

      dimensions: {
        window,
        screen
      },
      disableInput: false,
      chatStatus: '',
      uploadConfirm: '',
      requestConfirm: ''
    }
  }

  onChange = ({ window, screen }) => {
    this.setState({ dimensions: { window, screen } });
  };

  componentDidMount() {
    this.getChatStatusDB();
    Dimensions.addEventListener("change", this.onChange);
    firebase.database().ref('messages').child(this.state.userChat[0].itemRequestId).on('child_added', (value) => {
      this.setState((prevState) => {
        return {
          messagesList: [...prevState.messagesList, value.val()]
        }
      })
    })
    if (this.state.uploadConfirm == true && this.state.requestConfirm == true) {
      this.putChatStatus("delivered")
    }
  }

  componentWillUnmount() {
    Dimensions.removeEventListener("change", this.onChange);
    this.props.navigation.addListener('focus', () => {
      console.log('in focus new chat')})
    this.getChatStatusDB();

    if (this.state.uploadConfirm == true && this.state.requestConfirm == true) {
      this.putChatStatus("delivered")
    }
  }
  btnBack = () => {
    this.props.navigation.navigate('Navigator', { screen: 'Main Chat Page', params: { user: this.state.user1} });
  }
  getChatStatusDB = () => {

    fetch(urlGetChatStatus + '/' + this.state.user1.id + '/' + this.state.user2Upload.id + '/' + this.state.item.itemId, {
      method: 'GET',
      headers: new Headers({
        'Content-Type': 'application/json; charset=UTF-8',
        'Accept': 'application/json; charset=UTF-8',
      })
    })
      .then(res => {
        console.log('res.ok GetChat=', res.ok);
        return res.json()
      })
      .then(i => {
        console.log('chat from DB:', i)
        this.setState({ chatStatus: i[0].chatStatus, uploadConfirm: i[0].uploadConfirm, requestConfirm: i[0].requestConfirm }
          //, () => console.log('chat status from db: ', this.state.chatStatus)
        )
        if (i[0].chatStatus == "available") {
          this.setState({ disableInput: true })
        }
      },
        (error) => {
          console.log('Error', error);
        })
  }

  putChatStatus = (status) => {
    let splitId = this.state.itemIDFirebase.split("-")

    var chat = {
      uploadUser: splitId[1],
      requestUser: splitId[2],
      itemId: this.state.item.itemId,
      chatStatus: status
    }
    fetch(urlPutChatStatus, {
      method: 'PUT',
      body: JSON.stringify(chat),
      headers: new Headers({
        'Content-Type': 'application/json; charset=UTF-8',
        'Accept': 'application/json; charset=UTF-8',
      })
    })
      .then(res => {
        console.log('res.ok putChat=', res.ok);
        return res.json()
      })
      .then(i => {
        this.setState({ chatStatus: i[0].chatStatus })
        if (i[0].chatStatus == "available") {
          this.setState({ disableInput: true })
        }
      },
        (error) => {
          console.log('Error', error);
        })
  }

  putChatDate=()=>{
    let splitId = this.state.itemIDFirebase.split("-")
    fetch(urlPutChatLastMesDate +'/'+ splitId[1] +'/'+ splitId[2] +'/'+splitId[0], {
      method: 'PUT',
      headers: new Headers({
        'Content-Type': 'application/json; charset=UTF-8',
        'Accept': 'application/json; charset=UTF-8',
      })
    })
      .then(res => {
        console.log('res.ok putChat=', res.ok);
        return res.json()
      })
      .then(i => {
        console.log('put chat date success')
      },
        (error) => {
          console.log('Error', error);
        })
  }
  handleChange = (key) => val => {
    this.setState({ [key]: val })
  }

  sendMessage = async () => {
    const messageId = this.props.route.params.userChat[0].itemRequestId;
    if (this.state.textMessage.length > 0) {
      let msgId = firebase.database().ref('messages').child(this.state.userChat[0].itemRequestId).push().key;

      let updates = {};
      let message = {
        message: this.state.textMessage,
        time: firebase.database.ServerValue.TIMESTAMP,
        from: this.state.userChat[0].UsersList[0],
      }
      updates['messages/' + messageId + '/' + msgId] = message;
      //console.log('update: ', updates)
      firebase.database().ref().update(updates)

      let bodyMessage = `${this.state.user1.firstName} שלח.ה לך הודעה\n ${this.state.textMessage}`
      const pushMessage = {
        to: this.state.user2Upload.userToken,
        sound: 'default',
        title: 'קיבלת הודעה חדשה',
        body: bodyMessage,
        data: { type: "message", from: this.state.userChat, item: this.state.item }
      };

      this.sendPushNotification(pushMessage)
      this.putChatDate();

      this.setState({ textMessage: '' })
    }
  }
  sendPushNotification = async (pushMessage) => {

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pushMessage),
    });
  }

  renderMessage = ({ item }) => {
    return (
      <View style={{
        flexDirection: 'row',
        width: '65%', 
        alignSelf: item.from.id === this.state.userChat[0].UsersList[0].id ? 'flex-end' : 'flex-start',
        backgroundColor: item.from.id === this.state.userChat[0].UsersList[0].id ? '#c2d4bf' : '#c3acc8',
        borderRadius: 8,
        marginBottom: 10,
        direction: 'rtl',
        writingDirection: 'rtl',
      }}>
        <Text style={{ color: '#000', padding: 7, fontSize: 16 }}>
          {item.message}
        </Text>
        <Text style={{ color: '#000', padding: 3, fontSize: 12 }}>
          {this.convertTime(item.time)}</Text>
      </View>
    )
  }
  printDefaultMessage = () => {
    let splitId = this.state.itemIDFirebase.split("-")
    if (this.state.chatStatus == "waiting") {
      console.log('chat status: ', this.state.chatStatus)
      return (
        <View>
          {this.state.user1.id == splitId[1] &&
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 6, marginRight: 28, marginTop: 8 }}>
              <TouchableOpacity style={styles.noBtn} onPress={this.noBtn}>
                <Text>דחייה</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.yesBtn} onPress={this.yesBtn}>
                <Text>אישור</Text>
              </TouchableOpacity>
              <Text>למסירת הפריט:</Text>
            </View>}
        </View>
      )
    }
  }
  printConfirmSendBtn = () => {
    let splitId = this.state.itemIDFirebase.split("-")
    if (this.state.chatStatus == "available" && this.state.uploadConfirm == false) {
      return (
        <View>
          {this.state.user1.id == splitId[1] &&
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 6, marginRight: 28, marginTop: 8 }}>
              <TouchableOpacity style={styles.noBtn} onPress={this.noBtn}>
                <Text>ביטול</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.yesBtn} onPress={this.confirmUploadBtn}>
                <Text>אישור</Text>
              </TouchableOpacity>
              <Text>האם הפריט נמסר?</Text>
            </View>}
        </View>
      )
    }
    if (this.state.chatStatus == "available" && this.state.requestConfirm == false) {
      return (
        <View>
          {this.state.user1.id == splitId[2] &&
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 6, marginRight: 28, marginTop: 8 }}>
            
              <TouchableOpacity style={styles.yesBtn} onPress={this.confirmRequestBtn}>
                <Text>אישור</Text>
              </TouchableOpacity>
              <Text>האם קיבלת את הפריט?</Text>
            </View>}
        </View>)
    }
  }
  confirmUploadBtn = () => {
    let splitId = this.state.itemIDFirebase.split("-")
    var chat = {
      uploadUser: splitId[1],
      requestUser: splitId[2],
      itemId: this.state.item.itemId,
      uploadConfirm: true
    }
    this.setState({ uploadConfirm: true })

    fetch(urlPutUploadConfirm, {
      method: 'PUT',
      body: JSON.stringify(chat),
      headers: new Headers({
        'Content-Type': 'application/json; charset=UTF-8',
        'Accept': 'application/json; charset=UTF-8',
      })
    })
      .then(res => {
        console.log('res.ok putChat=', res.ok);
        return res.json()
      })
      .then(i => {
        console.log('i:', i)
      },
        (error) => {
          console.log('Error', error);
        })

    let bodyMessage = `${this.state.user1.firstName} מסר.ה את הפריט\n ${this.state.textMessage}`
    const pushMessage = {
      to: this.state.user2Upload.userToken,
      sound: 'default',
      title: 'פריט נמסר בהצלחה',
      body: bodyMessage,
      data: { type: "message", from: this.state.userChat, item: this.state.item }
    };

    this.sendPushNotification(pushMessage)
  }
  confirmRequestBtn = () => {
    let splitId = this.state.itemIDFirebase.split("-")
    var chat = {
      uploadUser: splitId[1],
      requestUser: splitId[2],
      itemId: this.state.item.itemId,
      requestConfirm: true
    }

    this.setState({ requestConfirm: true })

    fetch(urlPutRequestConfirm, {
      method: 'PUT',
      body: JSON.stringify(chat),
      headers: new Headers({
        'Content-Type': 'application/json; charset=UTF-8',
        'Accept': 'application/json; charset=UTF-8',
      })
    })
      .then(res => {
        console.log('res.ok putChat=', res.ok);
        return res.json()
      })
      .then(i => {
        this.props.navigation.navigate('Navigator', { screen: 'FeedPage', params: { user: this.state.user1 } })
      },
        (error) => {
          console.log('Error', error);
        })
  }
  yesBtn = () => {
    this.putChatStatus("available")

    let bodyMessage = `${this.state.user1.firstName} שלח.ה לך הודעה\n ${this.state.textMessage}`
    const pushMessage = {
      to: this.state.user2Upload.userToken,
      sound: 'default',
      title: 'קיבלת הודעה חדשה',
      body: bodyMessage,
      data: { type: "message", from: this.state.userChat, item: this.state.item }
    };

    let item = {
      message: 'יש! הבקשה שלך אושרה',
      time: firebase.database.ServerValue.TIMESTAMP,
      from: this.state.userChat[0].UsersList[1]
    }
    this.setState({ textMessage: item.message }, () =>
      this.sendMessage())

    this.sendPushNotification(pushMessage)
    this.renderMessage
    this.printConfirmSendBtn()

    this.setState({ disableInput: true })
  }

  noBtn = () => {
    this.putChatStatus("declined")

    let bodyMessage = `${this.state.user1.firstName} דחתה את בקשתך`
    const pushMessage = {
      to: this.state.user2Upload.userToken,
      sound: 'default',
      title: 'בקשתך נדחתה',
      body: bodyMessage,
      data: { type: "declineRequest", from: this.state.userChat, item: this.state.item }
    };

    let item = {
      message: 'מצטערים, המשתמש דחה את בקשתך',
      time: firebase.database.ServerValue.TIMESTAMP,
      from: this.state.userChat[0].UsersList[1]
    }
    this.setState({ textMessage: item.message }, () =>
      this.sendMessage())

    this.sendPushNotification(pushMessage)
    this.renderMessage
  }

  convertTime = (time) => {
    let d = new Date(time);
    let c = new Date();
    let result = (d.getHours() < 10 ? '0' : '') + d.getHours() + ':'
    result += (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
    if (c.getDay() !== d.getDay()) {
      result = d.getDay() + '/' + d.getMonth() + ' - ' + result;
    }
    return result;
  }

  printUser = () => {
    if (this.state.user1.id == this.state.userChat[0].UsersList[0].id) {
      return (
        <View key={this.state.user2Upload.id} style={styles.layout}>
          <View style={{ alignItems: 'center' }}>
            <Image source={{ uri: this.state.user2Upload.profilePicture }} style={styles.userImage} />
            <Text style={styles.Text}>{this.state.user2Upload.firstName} {this.state.user2Upload.lastName}</Text>
          </View>
          <View style={{ marginTop: 4, borderBottomColor: '#a7a7a7', borderBottomWidth: 1, marginBottom: 1, }} />
          <View style={{ alignItems: 'center', flexDirection: 'row-reverse' }}>
            <Image source={{ uri: this.state.item.image1 }} style={styles.itemImage}></Image>
            <View>
              <Text>{this.state.item.name}</Text>
              <View style={styles.header2}>
                <Text>{this.state.item.numberOfPoints}</Text>
                <MaterialCommunityIcons name="cash" color={"#7DA476"} size={20} />
              </View>
            </View>
          </View>
        </View>
      )
    } else {
      return (
        <View key={this.state.user1.id} style={styles.layout}>
          <View style={{ alignItems: 'center' }}>
            <Image source={{ uri: this.state.user1.profilePicture }} style={styles.userImage} />
            <Text style={styles.Text}>{this.state.user1.firstName} {this.state.user1.lastName}</Text>
          </View>
          <View style={{ marginTop: 4, borderBottomColor: '#a7a7a7', borderBottomWidth: 1, marginBottom: 1, }} />
          <View style={{ alignItems: 'center', flexDirection: 'row-reverse' }}>
            <Image source={{ uri: this.state.item.image1 }} style={styles.itemImage}></Image>
            <View>
              <Text>{this.state.item.name}</Text>
              <View style={styles.header2}>
                <Text>{this.state.item.numberOfPoints}</Text>
                <MaterialCommunityIcons name="cash" color={"#7DA476"} size={20} />
              </View>
            </View>
          </View>
        </View>
      )
    }
  }

  render() {
    return (
      <SafeAreaView >
        <View>
          <TouchableOpacity onPress={this.btnBack} style={styles.backBtn}>
            <Icon name="chevron-left" size={20} color="#101010" />
          </TouchableOpacity>
          {this.printUser()}
        </View>
        <View style={styles.line} />
        <ScrollView style={{ marginBottom: 290 }}>
          {this.state.disableInput ? this.printConfirmSendBtn() : this.printDefaultMessage()}
          <FlatList
            style={{ padding: 15 }}
            data={this.state.messagesList}
            renderItem={this.renderMessage}
            keyExtractor={(item, index) => index.toString()}
          />
        </ScrollView>
        <View style={styles.sendInputView}>
          <TextInput
            value={this.state.textMessage}
            placeholder="..."
            onChangeText={this.handleChange('textMessage')}
            editable={this.state.disableInput}
            style={styles.input}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={this.sendMessage}>
            <Icon name="paper-plane" size={20} color="#fff" style={{ margin: 13 }} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header2: {
    flexDirection: 'row-reverse',
  },
  yesBtn: {
    marginLeft: 5,
    marginRight: 10,
    backgroundColor: '#d8e4bc',
    borderRadius: 14,
    borderColor: '#d8e4bc',
    height: 35,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center'
  },
  noBtn: {
    marginLeft: 5,
    marginRight: 8,
    backgroundColor: '#e18e96',
    borderRadius: 14,
    borderColor: '#e18e96',
    height: 35,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center'
  },
  backBtn: {
    paddingTop: 50,
    paddingLeft: 25,
    alignItems: 'flex-start'
  },
  printDefaultView: {
    flexDirection: 'column',
    width: '70%', 
    alignSelf: 'flex-end',
    height: 'auto',
    backgroundColor: '#c2d4bf',
    borderRadius: 8,
    marginBottom: 10,
    marginLeft: 15,
    marginRight: 15,
    marginTop: 15,
    direction: 'rtl',
    writingDirection: 'rtl',
  },
  line: {
    marginLeft: 20,
    marginRight: 20,
    marginTop: 2,
    borderBottomColor: '#a7a7a7',
    borderBottomWidth: 1,
    marginBottom: 4
  },
  sendInputView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 590,
  },
  Text: {
    fontSize: 14,
    color: "#000",
  },
  layout: {
    marginRight: 20,
    marginLeft: 20,
    //marginTop: 35,
    justifyContent: 'space-between'
  },
  userImage: {
    height: 60,
    width: 60,
    borderRadius: 50,
  },
  itemImage: {
    height: 45,
    width: 45,
    borderRadius: 6,
    margin: 10
  },
  input: {
    padding: 10,
    borderWidth: 1,
    width: '75%',
    marginBottom: 10,
    marginTop: 45,
    marginLeft: 15,
    marginRight: 15,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderRadius: 14,
    borderColor: "#a7a7a7",
    direction: 'rtl',
    writingDirection: 'rtl',
  },
  input2: {
    height: 50,
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginVertical: 5,
    paddingVertical: 5,
    paddingHorizontal: 15,
    width: window.width - 30,
  },
  btnText: {
    color: 'darkblue',
    fontSize: 20
  },
  sendBtn: {
    marginTop: 35,
    marginRight: 20,
    marginLeft: 5,
    backgroundColor: '#a7a7a7',
    borderWidth: 1,
    borderRadius: 14,
    borderColor: '#a7a7a7',
    height: 50,
    width: 50,
  }
})