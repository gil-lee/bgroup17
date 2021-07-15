import React, { useEffect, useState } from 'react';
import { Text, View, ImageBackground, ScrollView, Image, StyleSheet, TouchableOpacity } from 'react-native'
import CardItem from './CardItem';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';


const urlPersonalItems = "http://proj.ruppin.ac.il/bgroup17/prod/api/UserNew/GetUser"
const urlPostFavorite = "http://proj.ruppin.ac.il/bgroup17/prod/api/FavoriteUsers/PostFavorite"
const urlDeleteFavorite = "http://proj.ruppin.ac.il/bgroup17/prod/api/FavoriteUsers/DeleteFav"
const urlGetFavorite = "http://proj.ruppin.ac.il/bgroup17/prod/api/FavoriteUsers/GetFavoriteList"

export default function OtherUserProfile(props) {

  const navigation = useNavigation();

  const { users } = props.route.params;
  const [userItemsList, setUserItemsList] = useState([])
  const [favoriteUser, setFavoriteUser] = useState(false)

  useEffect(() => {
    fetchPersonalItems()
    fetchHeartIcon()
  }, [])

  function fetchHeartIcon() {
    fetch(urlGetFavorite + "/" + users.logInUser.email + "/", {
      method: 'GET',
      headers: new Headers({
        'Content-Type': 'application/json; charset=UTF-8',
        'Accept': 'application/json; charset=UTF-8',
      })
    })
      .then(res => {
        console.log('res.ok getUsersList= ', res.ok);
        return res.json()
      })
      .then(favRows => {
        favRows.map(row => {
          if (users.user.email == row.emailFavUser) {
            setFavoriteUser(!favoriteUser)
          }
        })
      },
        (error) => {
          console.log('Error', error);
        })
  }
  function fetchPersonalItems() {

    fetch(urlPersonalItems + "/" + users.user.email + "/", {
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
        setUserItemsList(userItems[0].UserItemsListDTO)

      },
        (error) => {
          console.log('Error', error);
        })
  }

  function btnBack() {
    props.navigation.goBack()
  }

  function addFavorite() {

    setFavoriteUser(!favoriteUser)
    let favRow = {
      emailLGUser: users.logInUser.email,
      emailFavUser: users.user.email
    }
    fetch(urlPostFavorite, {
      method: 'POST',
      body: JSON.stringify(favRow),
      headers: new Headers({
        'Content-Type': 'application/json; charset=UTF-8',
        'Accept': 'application/json; charset=UTF-8',
      })
    })
      .then(res => {
        console.log('res.ok postFavUsers= ', res.ok);
        if (res.ok) {
          navigation.navigate('Navigator', { screen: 'FeedPage', params: { user: users.logInUser }, initial: false })
          navigation.navigate('Navigator', { screen: 'Profile Page', params: { user: users.logInUser }, initial: false  })
          navigation.navigate('Navigator', { screen: 'UploadDetails', params: { user: users.logInUser }, initial: false  })
          navigation.navigate('Navigator', { screen: 'Main Chat Page', params: { user: users.logInUser }, initial: false  })
          navigation.navigate('Navigator', { screen: 'Favorite', params: { user: users.logInUser }, initial: false  })
        }
        return res.json()
      })
      .then(favUsers => {
        console.log("favorite users: ", favUsers)
      },
        (error) => {
          console.log('Error', error);
        })

  }

  function removeFavorite() {
    setFavoriteUser(!favoriteUser)
    let favRow = {
      emailLGUser: users.logInUser.email,
      emailFavUser: users.user.email
    }
    fetch(urlDeleteFavorite, {
      method: 'DELETE',
      body: JSON.stringify(favRow),
      headers: new Headers({
        'Content-Type': 'application/json; charset=UTF-8',
        'Accept': 'application/json; charset=UTF-8',
      })
    })
      .then(res => {
        console.log('res.ok DELETEFavUsers= ', res.ok);
        return res.json()
      })
      .then(favUsers => {
        console.log("favorite users: ", favUsers)
      },
        (error) => {
          console.log('Error', error);
        })
  }
  return (
    <ImageBackground source={require('../assets/bgImage1.png')} style={styles.image}>
      <View>
        <View style={styles.container}>
          <TouchableOpacity onPress={btnBack} style={styles.backBtn}>
            <Icon name="chevron-left" size={20} color="#101010" />
          </TouchableOpacity>
          <View style={{ flexDirection: 'row' }}>
            <Image source={{ uri: users.user.profilePicture }} style={styles.userImage}></Image>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.userHeader}>{users.user.firstName} {users.user.lastName}</Text>
              <View style={styles.itemCloset}>
                <MaterialCommunityIcons name="wardrobe-outline" color={"#a7a7a7"} size={25} />
                <Text style={{ fontWeight: "bold" }}>{users.user.numOfItems}  </Text>
              </View>
            </View>
            {favoriteUser ?
              <TouchableOpacity onPress={removeFavorite} style={styles.heartBtn}>
                <MaterialCommunityIcons name="heart" color={"#9d76a5"} size={25} />
              </TouchableOpacity> :
              <TouchableOpacity onPress={addFavorite} style={styles.heartBtn}>
                <MaterialCommunityIcons name="heart-outline" color={"#a7a7a7"} size={25} />
                <View></View>
              </TouchableOpacity>}
          </View>
        </View>
        <View style={styles.line} />
        <ScrollView>
          {userItemsList ?
            userItemsList.map(x =>
              <CardItem key={x.itemsListDTO[0].itemId} data={x.itemsListDTO[0]} navigation={props.navigation} user={users.user} logInUser={users.logInUser}/>)
            : null}
          <Text style={{ paddingBottom: 160 }}></Text>
        </ScrollView>
      </View>
    </ImageBackground>
  )

}
const styles = StyleSheet.create({
  line: {
    marginLeft: 20,
    marginRight: 20,
    marginTop: 8,
    borderBottomColor: '#a7a7a7',
    borderBottomWidth: 1
  },
  backAndHeart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backBtn: {
    paddingLeft: 25,
  },
  heartBtn: {
    paddingLeft: 25,
    marginRight: 20
  },
  image: {
    flex: 1,
    resizeMode: 'cover'
  },
  Text: {
    fontSize: 12,
  },
  itemCloset: {
    alignItems: 'center',
    flexDirection: 'row',

  },
  footer: {
    flexDirection: 'row-reverse',
    marginLeft: 32,
    marginTop: 15
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
  },
  userHeader: {
    marginLeft: 6
    ,
    fontSize: 14,
    fontWeight: 'bold'
  },
})