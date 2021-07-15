import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';


export default function FavoriteListCard(props) {

  const urlDeleteFavorite = "http://proj.ruppin.ac.il/bgroup17/prod/api/FavoriteUsers/DeleteFav"

  const navigation = useNavigation();
  const [favoriteUser, setFavoriteUser] = useState(true)
  const { user } = props
  const { logInUser } = props

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      navigation.navigate('Navigator', { screen: 'Favorite', params: { user: logInUser }, initial: false })
    })
  return unsubscribe;
  },[navigation])

  function goToOtherProfile() {
    var users = { user, logInUser }
    navigation.navigate('OtherUserProfile', { users: users })
  }

  function removeFavorite() {
    setFavoriteUser(!favoriteUser)
    let favRow = {
      emailLGUser: logInUser.email,
      emailFavUser: user.email
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
        
        navigation.navigate('Navigator', { screen: 'Profile Page', params: { user: logInUser }, initial: false })
        navigation.navigate('Navigator', { screen: 'UploadDetails', params: { user: logInUser }, initial: false })
        navigation.navigate('Navigator', { screen: 'Main Chat Page', params: { user: logInUser }, initial: false })
        navigation.navigate('Navigator', { screen: 'FeedPage', params: { user: logInUser }, initial: false })
        navigation.navigate('Navigator', { screen: 'Favorite', params: { user: logInUser } })

        //console.log("favorite users: ", favUsers)
      },
        (error) => {
          console.log('Error', error);
        })
  }


  return (
    <View>
      <View key={user.id} style={styles.layout}>
        <TouchableOpacity onPress={goToOtherProfile}>
          <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', }}>
            <View style={{ justifyContent: 'flex-start', flexDirection: 'row' }}>
              <Text style={styles.Text}>{user.firstName} {user.lastName}</Text>
              <Image source={{ uri: user.profilePicture }} style={styles.userImage} />
              <View style={{ justifyContent: 'flex-start' }}>
              </View>
            </View>
          </View>
        </TouchableOpacity>
        <View style={{ justifyContent: 'flex-end' }}>
          {favoriteUser ?
            <TouchableOpacity onPress={removeFavorite} style={styles.heartBtn}>
              <MaterialCommunityIcons name="heart" color={"#9d76a5"} size={25} />
            </TouchableOpacity> :
            null}
        </View>
      </View>
      <View style={styles.line} />
    </View>
  )
}

const styles = StyleSheet.create({
  Text: {
    fontSize: 17,
    color: "#000",
    paddingTop: 19,
    paddingRight: 19,
    paddingLeft: 19
  },
  layout: {
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
  line: {
    marginLeft: 10,
    marginRight: 10,
    marginTop: 10,
    marginBottom: 10,
    borderBottomColor: '#a7a7a7',
    borderBottomWidth: 1
  },
  heartBtn: {
    paddingBottom: 20,
    paddingLeft: 25,
    marginRight: 20
  },
})