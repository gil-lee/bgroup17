import React, { Component, createRef } from 'react'
import { Text, View, StyleSheet, Image, ImageBackground, ScrollView, Alert, TextInput } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Dropdown } from 'react-native-material-dropdown-v2';
import CardItemFeed from './CardItemFeed';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

const urlGetItems = "http://proj.ruppin.ac.il/bgroup17/prod/api/UserNew/UsersListGet"
const urlGetItemsDist = "http://proj.ruppin.ac.il/bgroup17/prod/api/UserNew/GetUserItemsListDistance"
const urlItemSize = "http://proj.ruppin.ac.il/bgroup17/prod/api/ItemSize";
const urlItemStyle = "http://proj.ruppin.ac.il/bgroup17/prod/api/ItemStyle";
const urlItemPrice = "http://proj.ruppin.ac.il/bgroup17/prod/api/ItemPrice ";
const urlConditionPrice = "http://proj.ruppin.ac.il/bgroup17/prod/api/ConditionPrices";
const urlPutToken = "http://proj.ruppin.ac.il/bgroup17/prod/api/UserNew/PutUserToken";
const urlGetPostPutFilter = "http://proj.ruppin.ac.il/bgroup17/prod/api/UserFilter/GetUserFilter";
const urlSmartFilter = "http://proj.ruppin.ac.il/bgroup17/prod/api/UserNew/GetForSmartApp"
const urlGetAllTokensFoeReminder = "http://proj.ruppin.ac.il/bgroup17/prod/api/Chat/GetChatListForReminder"

const typeTemp = [];
const sizeTemp = [];
const conditionTemp = [];
const styleTemp = [];

const types = [];
const conditions = [];
const sizes = [];
const styless = [];


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default class FeedPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userTemplate: this.props.route.params.user,
      userShowItems: this.props.route.params.user.showItemsFeed,
      itemTemplate: '',
      itemsList: [],
      itemListDB: [],
      usersList: [],
      avatarLevelUser: 1,
      itemType: [],
      size: [],
      condition: [],
      itemStyle: [],
      selectedType: '',
      selectedSize: '',
      selectedCondition: '',
      selectedStyle: '',
      filterName: '',

      search: '',
      latitudeSt: 0,
      longitudeSt: 0,
      locationPre: false,

      notification: {},
      userToken: '',
      badge: 0,

      tokensForRemider: ''
    }
    this.sizeDD = null;
    this.styleDD = null;
    this.typeDD = null;
    this.conDD = null;

    this.notificationListener = createRef();
    this.responseListener = createRef();
    this.forceUpdate();
  }

  componentDidMount() {
    this.getCurrentLocation()
    this.callFetchFunc()

    this.registerForPushNotificationsAsync().then(token => this.fetchpPutToken(token));
    Notifications.addNotificationReceivedListener(this._handleNotification);
    Notifications.addNotificationResponseReceivedListener(this._handleNotificationResponse);

    this.getAllTokens()
  }
  componentDidUpdate(prevProps) {
    if (prevProps.isFocus !== this.props.isFocus) {
      this.forceUpdate();
      this.getLocation(true)
    }
  }

  _handleNotification = notification => {
    this.setState({ notification: notification });
  };

  _handleNotificationResponse = response => {
    let usersToChat = response.notification.request.content.data.from;
    let itemToChat = response.notification.request.content.data.item;
    if (response.notification.request.content.data.type == "requestMessage" ||
      response.notification.request.content.data.type == "message") {
      this.props.navigation.navigate('NewChat', { userChat: usersToChat, item: itemToChat })
    }
    if (response.notification.request.content.data.type == "declineRequest" ||
      response.notification.request.content.data.type == "filterMessage") {
      this.props.navigation.navigate('Navigator', { screen: 'FeedPage', params: { user: this.state.userTemplate } })
    }
    if (response.notification.request.content.data.type == "messageReminder") {
      this.props.navigation.navigate('Navigator', { screen: 'Main Chat Page', params: { user: this.state.userTemplate } })
    }
  };

  callFetchFunc = () => {
    this.fetchDropDown(urlItemSize);
    this.fetchDropDown(urlItemStyle);
    this.fetchDropDown(urlItemPrice);
    this.fetchDropDown(urlConditionPrice);
    this.getAvatarForUser(this.props.route.params.user)
  }
  componentWillUnmount() {
    this.setState({ userTemplate: this.props.route.params.user })
    this.getLocation(true)
  }
  componentWillReceiveProps() {
    this.setState({ userTemplate: this.props.route.params.user })
    this.getLocation(true)
  }
  sendNotiForReminder = (token) => {
    let tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(20);
    tomorrow.setMinutes(0);

    Notifications.scheduleNotificationAsync({
      content: {
        to: token,
        sound: 'default',
        title: `קיים צ'אט פעיל`,
        body: `ישנו צ'אט שלא אישרת העברת/ קבלת פריט`,
        data: { type: "messageReminder", from: this.state.userChat, item: this.state.item }
      },
      trigger: tomorrow,
    });
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

  getTokenFromExpo = () => {
    this.registerForPushNotificationsAsync().then(token => this.setState({ userToken: token }, () => this.fetchpPutToken(token)));

    this.notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      //console.log('noti2:        ', JSON.stringify(notification.request));
      this.setState({ notification: notification })
      //, () =>console.log('noti:        ', JSON.stringify(notification.request));
    });
    this.responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      //console.log('res2:           ', JSON.stringify(response));
      const navi = response.notification.request.content.data;
      //console.log('res:           ', JSON.stringify(response));

      if (navi.type == 'yes') {
        navigation.navigate('NewChat', { userChat: userChat, item: props.data.itemId })
      }
      if (navi.type == 'no') {
        navigation.navigate('Navigator', { screen: 'FeedPage', params: { user: props.logInUser } })
      }
    });

    console.log('response1', this.responseListener)
    console.log('response2', this.responseListener.current)

    return () => {
      Notifications.removeNotificationSubscription(this.notificationListener.current);
      Notifications.removeNotificationSubscription(this.responseListener.current);
    };
  }
  registerForPushNotificationsAsync = async () => {
    let token;
    if (Constants.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
      //console.log('token in feed page: ', token);
    } else {
      alert('Must use physical device for Push Notifications');
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    return token;
  }

  fetchpPutToken = async (token) => {
    let tempToken = token
    let newUser = {
      avatarlevel: this.state.userTemplate.avatarlevel,
      birthDate: this.state.userTemplate.birthDate,
      email: this.state.userTemplate.email,
      firstName: this.state.userTemplate.firstName,
      id: this.state.userTemplate.id,
      lastName: this.state.userTemplate.lastName,
      numOfItems: this.state.userTemplate.numOfItems,
      numOfPoints: this.state.userTemplate.numOfPoints,
      password: this.state.userTemplate.password,
      phoneNumber: this.state.userTemplate.phoneNumber,
      profilePicture: this.state.userTemplate.profilePicture,
      radius: this.state.userTemplate.radius,
      residence: this.state.userTemplate.residence,
      userToken: tempToken
    }

    this.setState({ userTemplate: newUser }
      //, () => console.log('new user with token: ', newUser)
    )

    await fetch(urlPutToken + "/" + this.state.userTemplate.email + "/" + tempToken + "/", {
      method: 'PUT',
      headers: new Headers({
        'Content-Type': 'application/json; charset=UTF-8',
        'Accept': 'application/json; charset=UTF-8',
      })
    })
      .then(res => {
        console.log('res.ok putToken= ', res.ok);
        return res.json()
      })
      .then(t => {
        console.log('result t:   ', t)
      },
        (error) => {
          console.log('Error', error);
        })
  }

  getCurrentLocation = async () => {

    let premission = await Location.hasServicesEnabledAsync();
    if (premission === false) {
      Alert.alert('אופס..', 'לתשומת לבך לא ניתן לראות פריטים זמינים ללא הפעלת שירות מיקום נוכחי',
        [
          { text: "התעלם", onPress: () => this.setState({ locationPre: false }) },
          {
            text: "הפעל שירותי מיקום",
            onPress: this.getPremission
          }
        ])
    }
    if (premission === true) {
      this.getPremission()
    }
  }

  getPremission = async () => {
    this.setState({ locationPre: true });
    let prem = await Location.requestPermissionsAsync();
    this.getLocation(prem)
  }
  getLocation = async (prem) => {
    if (prem.granted == true) {
      let location = await Location.getCurrentPositionAsync();
      this.setState(
        {
          latitudeSt: location.coords.latitude,
          longitudeSt: location.coords.longitude,
          locationPre: true
        }
        //, () => console.log('longi & lati after premission: ', this.state.longitudeSt + this.state.latitudeSt)
      )
      this.fetchUserItemsByEmail(this.state.longitudeSt, this.state.latitudeSt)
      this.props.navigation.navigate('Navigator', { screen: 'UploadDetails', initial: false, params: { longitude: this.state.longitudeSt, latitude: this.state.latitudeSt } })
      this.props.navigation.navigate('Navigator', { screen: 'FeedPage' })
    }
  }

  fetchUserItemsByEmail = async (longi, lati) => {
    await fetch(urlSmartFilter + "/" + this.state.userTemplate.email + "/" + longi + "/" + lati + "/" + this.state.userShowItems, {
      method: 'GET',
      headers: new Headers({
        'Content-Type': 'application/json; charset=UTF-8',
        'Accept': 'application/json; charset=UTF-8',
      })
    })
      .then(res => {
        console.log('res.ok getAllItems= ', res.ok);
        return res.json()
      })
      .then(items => {
        this.setState({ itemsList: items, itemListDB: items }
          //,()=> console.log('items: ', this.state.itemsList)
        )
      },
        (error) => {
          console.log('Error', error);
        })
  }

  getAvatarForUser = (user) => { 
    let level = user.avatarlevel
    let imageUri = "http://proj.ruppin.ac.il/bgroup17/prod/AvatarImages/avatarLevel" + level + ".png"

    this.setState({ avatarLevelUser: imageUri })
  }

  fetchDropDown = (url) => { 

    fetch(url, {
      method: 'GET',
      headers: new Headers({
        'Content-Type': 'application/json; charset=UTF-8',
        'Accept': 'application/json; charset=UTF-8',
      })
    })
      .then(res => {
        console.log('res.ok=', res.ok);
        return res.json()
      })
      .then(dropDownArr => { 
        if (url == urlItemPrice) {
          for (let i = 0; i < dropDownArr.length; i++) {
            typeTemp[i] = dropDownArr[i].name
            types[i] = dropDownArr[i]
          }
          this.setState({ itemType: typeTemp })
        }
        if (url == urlItemSize) { 
          for (let i = 0; i < dropDownArr.length; i++) {
            sizeTemp[i] = dropDownArr[i].size
            sizes[i] = dropDownArr[i]
          }
          this.setState({ size: sizeTemp })
        }
        if (url == urlConditionPrice) {
          for (let i = 0; i < dropDownArr.length; i++) {
            conditionTemp[i] = dropDownArr[i].condition
            conditions[i] = dropDownArr[i]

          }
          this.setState({ condition: conditionTemp })
        }
        if (url == urlItemStyle) { 
          for (let i = 0; i < dropDownArr.length; i++) {
            styleTemp[i] = dropDownArr[i].style
            styless[i] = dropDownArr[i]
          }
          this.setState({ itemStyle: styleTemp })
        }
      },
        (error) => {
          console.log('Error', error);
        })
  }

  clearDropDown = () => {
    this.setState({
      selectedCondition: '',
      selectedSize: '',
      selectedStyle: '',
      selectedType: ''
    })
    this.resetMyDropdown()
    this.getCurrentLocation()
    this.callFetchFunc()
  }

  resetMyDropdown() {
    if (this.sizeDD) {
      this.sizeDD.setState({ value: '' });
    }
    if (this.styleDD) {
      this.styleDD.setState({ value: '' });
    }
    if (this.typeDD) {
      this.typeDD.setState({ value: '' });
    }
    if (this.conDD) {
      this.conDD.setState({ value: '' });
    }
  }

  filterItems(text, inputType) {
    console.log('text: ', inputType)
    let newItemsList;
    switch (inputType) {
      case "type":
        newItemsList = this.state.itemsList.filter(item =>
          item.itemsListDTO[0].priceList[0].name == text)

        break;
      case "size":
        newItemsList = this.state.itemsList.filter(item =>
          item.itemsListDTO[0].sizeList[0].size == text)
        break;
      case "style":
        newItemsList = this.state.itemsList.filter(item =>
          item.itemsListDTO[0].styleList[0].style == text)
        break;
      case "condition":
        newItemsList = this.state.itemsList.filter(item =>
          item.itemsListDTO[0].conditionList[0].condition == text)
        break;
    }

    this.setState({ itemsList: newItemsList });
    fetch(urlGetPostPutFilter + "/" + this.state.userTemplate.email + "/" + inputType + "/" + text, {
      method: 'GET',
      headers: new Headers({
        'Content-Type': 'application/json; charset=UTF-8',
        'Accept': 'application/json; charset=UTF-8',
      })
    })
      .then(res => {
        console.log('res.ok=', res.ok);
        return res.json()
      })
      .then(userFilter => {
        console.log('userFilter: ', userFilter)
      },
        (error) => {
          console.log('Error', error);
        })
  }

  getAllTokens = () => {
    fetch(urlGetAllTokensFoeReminder, {
      method: 'GET',
      headers: new Headers({
        'Content-Type': 'application/json; charset=UTF-8',
        'Accept': 'application/json; charset=UTF-8',
      })
    })
      .then(res => {
        return res.json()
      })
      .then(tokens => {
        this.setState({ tokensForRemider: tokens }
          //, () => {console.log('tokens for remider: ', this.state.tokensForRemider)}
          )
        for (let i = 0; i <= tokens.length; i++) {
          this.sendNotiForReminder(tokens[i])
        }
      },
        (error) => {
          console.log('Error', error);
        })
  }

  render() {
    return (
      <ImageBackground source={require('../assets/bgImage1.png')} style={styles.image}>
        <View>
          <View style={styles.container}>
            <TouchableOpacity style={styles.searchSection}>
              <MaterialCommunityIcons name="magnify" color={"#a7a7a7"} size={20} />
              <TextInput style={{}}
                placeholder='חיפוש'
                onChangeText={text => {
                  let newItemsList = this.state.itemListDB.filter(item =>
                    item.itemsListDTO[0].name.includes(text) ||
                    item.itemsListDTO[0].description.includes(text));
                  this.setState({ itemsList: newItemsList });
                }} />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row' }}>
              <Image source={{ uri: this.state.userTemplate.profilePicture }} style={styles.userImage}></Image>
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.userHeader}>{this.state.userTemplate.firstName} {this.state.userTemplate.lastName}</Text>
                <View style={{ flexDirection: 'row' }}>
                  <MaterialCommunityIcons name="cash" color={"#7DA476"} size={20} />
                  <Text style={styles.userHeader}>{this.state.userTemplate.numOfPoints}</Text>
                </View>
              </View>
            </View>
            <Image source={{ uri: `${this.state.avatarLevelUser}` }} style={styles.avatar} ></Image>
          </View>
          <View style={styles.line} />
          <Text></Text>
          <View style={{ flexDirection: 'row-reverse', justifyContent: "center", alignContent: "center" }}>

            <Dropdown
              label='מידה'
              data={this.state.size.map((size, s) => ({ key: s, value: size }))}
              style={styles.dropDwSmall}
              onChangeText={(text) => this.filterItems(text, 'size')}
              underlineColor={'transparent'}
              ref={c => (this.sizeDD = c)}
            />
            <Dropdown
              label='סוג'
              data={this.state.itemType.map((type, t) => ({ key: t, value: type }))}
              style={styles.dropDw}
              onChangeText={(text) => this.filterItems(text, 'type')}
              underlineColor={'transparent'}
              ref={c => (this.typeDD = c)}
            />
            <Dropdown
              label='סגנון'
              data={this.state.itemStyle.map((itemStyle, i) => ({ key: i, value: itemStyle }))}
              style={styles.dropDwSmall}
              onChangeText={(text) => this.filterItems(text, 'style')}
              underlineColor={'transparent'}
              ref={c => (this.styleDD = c)}
            />
            <Dropdown
              label='מצב'
              data={this.state.condition.map((condition, c) => ({ key: c, value: condition }))}
              style={styles.dropDwSmall}
              onChangeText={(text) => this.filterItems(text, 'condition')}
              underlineColor={'transparent'}
              ref={c => (this.conDD = c)}
            />
            <TouchableOpacity style={{ margin: 5 }} onPress={this.clearDropDown}>
              <MaterialCommunityIcons name="close" color={"#a7a7a7"} size={20} />
            </TouchableOpacity>
          </View>

          <View style={styles.line} />
          <ScrollView>
            {this.state.locationPre == false &&
              <View style={{ alignItems: 'center', marginTop: 50 }}>
                <Text>אין פריטים זמינים לצפייה...</Text>
                <Text>לצפייה בפריטים הפעל/י את שירותי המיקום</Text>
              </View>}


            {this.state.itemsList ?
              this.state.itemsList.map((item) =>
                <CardItemFeed key={item.itemsListDTO[0].id} data={item.itemsListDTO[0]} user={item.userListDTO[0]} navigation={this.props.navigation} logInUser={this.state.userTemplate} />) : null}

            <Text style={{ paddingBottom: 180 }}></Text>
          </ScrollView>
        </View>
      </ImageBackground>
    )
  }
}
const styles = StyleSheet.create({
  Text: {
    fontSize: 25,
    fontWeight: '500'
  },
  searchSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',

  },
  sendBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderRadius: 6,
    borderColor: 'transparent',
    height: 43,
    width: 65,
  },
  container: {
    alignItems: 'center',
    paddingTop: 50,
    paddingLeft: 10,
    paddingRight: 10,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  requestBtn: {
    width: 40,
    backgroundColor: "#9d76a5",
    borderRadius: 10,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  search: {
    alignSelf: 'flex-start'
  },
  btnText: {
    color: "white",
    fontSize: 14,
    fontWeight: '500'
  },
  avatar: {
    height: 60,
    width: 40,
  },
  line: {
    marginLeft: 20,
    marginRight: 20,
    marginTop: 8,
    borderBottomColor: '#a7a7a7',
    borderBottomWidth: 1
  },
  userHeader: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: 'bold'
  },
  userImage: {
    height: 60,
    width: 60,
    borderRadius: 50
  },
  dropDw: {
    width: 110,
    height: 40,
    marginTop: -1,
    marginBottom: 5,
    marginLeft: 2.5,
    marginRight: 2.5,
    color: '#414042',
    backgroundColor: 'transparent',
    borderRadius: 6,
    borderTopRightRadius: 6,
    borderTopLeftRadius: 6,
    borderWidth: 1,
    borderColor: "#A7A7A7",
    fontSize: 10,
    direction: 'rtl',
  },
  dropDwSmall: {
    width: 60,
    height: 40,
    marginTop: -1,
    marginBottom: 5,
    marginLeft: 2.5,
    marginRight: 2.5,
    color: '#414042',
    backgroundColor: 'transparent',
    borderRadius: 6,
    borderTopRightRadius: 6,
    borderTopLeftRadius: 6,
    borderWidth: 1,
    borderColor: "#A7A7A7",
    fontSize: 10,
    direction: 'rtl',
  },
  btnClean: {
    borderWidth: 1,
    borderColor: "#9d76a5",
    borderRadius: 6,
    width: 60,
    height: 40,
  },
  image: {
    flex: 1,
    resizeMode: 'cover'
  },
})
