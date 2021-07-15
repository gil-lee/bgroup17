import React, { Component } from 'react'
import { Text, View, StyleSheet, TouchableOpacity, Image, ScrollView, ImageBackground } from 'react-native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CardItemShow from './CardItemShow';

const urlSentence = "http://proj.ruppin.ac.il/bgroup17/prod/api/DailySentence";
const urlPersonalItems = "http://proj.ruppin.ac.il/bgroup17/prod/api/UserNew/GetUser"

export default class ProfilePage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      user: this.props.route.params.user,
      randomSentence: "",
      userPersonalItems: "",
      userItemsList: this.props.route.params.userItemsList,
      sizeN: '',
      typeN: '',
      stylN: '',
      conditionN: '',

      itemType: [],
      itemSize: [],
      itemCond: [],
      itemStyle: [],
    }
  }
  componentDidMount() {
    this.callFetchFunc()
    this.props.navigation.navigate('Navigator', { screen: 'UploadDetails', params: { user: this.props.route.params.user } })
  }
  componentWillUnmount() {
    this.setState({ user: this.props.route.params.user })
  }
  componentWillReceiveProps() {
    this.callFetchFunc()
  }
  componentDidUpdate(prevProps) {
    if (prevProps.isFocus !== this.props.isFocus) {
      this.forceUpdate();
    }
  }

  callFetchFunc = () => {
    this.fetchSentences()
    this.getAvatarForUser(this.props.route.params.user)
    this.fetchPersonalItems()
  }

  fetchSentences = () => {

    fetch(urlSentence, {
      method: 'GET',
      headers: new Headers({
        'Content-Type': 'application/json; charset=UTF-8',
        'Accept': 'application/json; charset=UTF-8',
      })
    })
      .then(res => {
        console.log('res.ok getSentence= ', res.ok);
        return res.json()
      })
      .then(sentences => {
        this.setState({ randomSentence: sentences })
      },
        (error) => {
          console.log('Error', error);
        })
  }

  getAvatarForUser = (user) => {
    let level = user.avatarlevel
    console.log('level: ', level)
    let imageUri = "http://proj.ruppin.ac.il/bgroup17/prod/AvatarImages/avatarLevel" + level + ".png"

    this.setState({ avatarLevelUser: imageUri }, () => console.log('avatar in feed uri: ', this.state.avatarLevelUser))
  }

  fetchPersonalItems = () => {

    fetch(urlPersonalItems + "/" + this.state.user.email + "/", {
      method: 'GET',
      headers: new Headers({
        'Content-Type': 'application/json; charset=UTF-8',
        'Accept': 'application/json; charset=UTF-8',
      })
    })
      .then(res => {
        console.log('res.ok getUsersItems= ', res.ok);
        return res.json()
      })
      .then(userItems => {
        this.setState({ userItemsList: userItems[0].UserItemsListDTO }, () => console.log('location from sql: ', userItems[0].location)
        )
      },
        (error) => {
          console.log('Error', error);
        })
  }

  goToSettings = () => {
    this.props.navigation.navigate('SettingsPage', { user: this.state.user })
  }

  render() {
    return (
      <ImageBackground source={require('../assets/bgImage1.png')} style={styles.image}>
        <View>
          <View>
            <View style={styles.container}>
              <View></View>
              <View style={{ flexDirection: 'row' }}>
                <Image source={{ uri: this.state.user.profilePicture }} style={styles.userImage}></Image>
                <View style={{ alignItems: 'center' }}>
                  <Text style={styles.userHeader}>{this.state.user.firstName} {this.state.user.lastName}</Text>
                  <View style={{ flexDirection: 'row' }}>
                    <MaterialCommunityIcons name="cash" color={"#7DA476"} size={20} />
                    <Text style={styles.userHeader}>{this.state.user.numOfPoints}</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity onPress={this.goToSettings} style={{}}>
                <MaterialCommunityIcons name="cog" color={"#a7a7a7"} size={27} />
              </TouchableOpacity>
            </View>

            <View style={styles.itemCloset}>
              {this.state.user.numOfItems ?
                <Text style={styles.Text, { marginBottom: 2 }}> <Text style={{ fontWeight: "bold", textDecorationLine: 'underline' }}>{this.state.user.numOfItems}</Text> פריטים בארונך האישי</Text> : null}
            </View>
            <View style={styles.line} ></View>
          </View>
        </View>

        <ScrollView>
          {this.state.randomSentence ?
            <View style={styles.sentAvat}>
              <Image source={{ uri: `${this.state.avatarLevelUser}` }} style={styles.avatar} ></Image>
              <Text></Text>
              <Text style={{ fontSize: 10, marginTop: 40 }}>{this.state.user.avatarlevel}/5</Text>
              <Text style={styles.dailySent}>{this.state.randomSentence}</Text>
            </View> : null}

          {this.state.userItemsList ?
            this.state.userItemsList.map(x =>
              <CardItemShow key={x.itemsListDTO[0].id} data={x.itemsListDTO[0]} navigation={this.props.navigation} user={this.state.user} showAlert={false} />)
            : null}
          <View style={styles.line} ><Text></Text></View>
          <View style={{ paddingBottom: 30 }}></View>
        </ScrollView>
      </ImageBackground>
    )
  }
}
const styles = StyleSheet.create({
  Text: {
    fontSize: 12,
  },
  itemCloset: {
    alignItems: 'center'
  },
  footer: {
    flexDirection: 'row-reverse',
    marginLeft: 32,
    marginTop: 15
  },
  line: {
    marginLeft: 20,
    marginRight: 20,
    marginTop: 8,
    marginBottom: 10,
    borderBottomColor: '#a7a7a7',
    borderBottomWidth: 1
  },
  avatar: {
    height: 60,
    width: 40,
    marginLeft: 20
  },
  dailySent: {
    fontSize: 11,
    marginTop: 20,
    marginLeft: 20,
    flex: 1,
    flexWrap: 'wrap',
  },
  sentAvat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    maxWidth: 300,
    flexShrink: 1,
  },
  container: {
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 60,
    marginBottom: 10,
  },
  userImage: {
    height: 60,
    width: 60,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center'
  },
  userHeader: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: 'bold',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center'
  },
  image: {
    flex: 1,
    resizeMode: 'cover',
  },
})