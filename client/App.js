
import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SignUpPage from './SignUp/SignUpPage';
import LogInPage from './LogIn/LogInPage';
import FeedPage from './Home/FeedPage';
import Navigator from './Home/Navigator';
import ConfirmUpload from './UploadItem/ConfirmUpload';
import CitiesList from './SignUp/CitiesList';
import DeleteItem from './Profile/DeleteItem';
import ProfilePage from './Profile/ProfilePage';
import SettingsPage from './Profile/SettingsPage';
import MainChatPage from './Chat/MainChatPage'
import OtherUserProfile from './Profile/OtherUserProfile'
import NewChat from './Chat/NewChat';
import ZoomImages from './Gallery/ZoomImages';
import { LogBox } from 'react-native';


const Stack = createStackNavigator();

export default function App() {
  LogBox.ignoreLogs(['Warning: ...']);
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LogIn" screenOptions={{headerShown: false}}>
        <Stack.Screen name="LogIn" component={LogInPage} />
        <Stack.Screen name="Sign Up" component={SignUpPage} />
        <Stack.Screen name="FeedPage" component={FeedPage} />
        <Stack.Screen name="Navigator" component={Navigator} /> 
        <Stack.Screen name="ConfirmUpload" component={ConfirmUpload} />     
        <Stack.Screen name="CitiesList" component={CitiesList}/>  
        <Stack.Screen name="DeleteItem" component={DeleteItem}/> 
        <Stack.Screen name="Profile Page" component={ProfilePage}/> 
        <Stack.Screen name="SettingsPage" component={SettingsPage}/>  
        <Stack.Screen name="NewChat" component={NewChat}/>
        <Stack.Screen name="ZoomImages" component={ZoomImages}/>  
        <Stack.Screen name="Main Chat Page" component={MainChatPage}/>
        <Stack.Screen name="OtherUserProfile" component={OtherUserProfile}/>  
      </Stack.Navigator>
    </NavigationContainer>


  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 30,
  },
});
