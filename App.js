// 1. IMPORTS DE BIBLIOTECAS

import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Image,
  StatusBar,
  Text,
  View,
} from "react-native";

import "react-native-gesture-handler";

import { registerRootComponent } from "expo";

import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { SafeAreaProvider } from "react-native-safe-area-context";


// 2. PROVIDERS E SERVIÇOS

import { CountryProvider } from "./src/i18n/context/CountryContext";

import { LanguageProvider } from "./src/i18n/context/LanguageContext";

import {
  ThemeProvider,
  useTheme,
} from "./src/i18n/context/ThemeContext";

import { supabase } from "./src/services/supabase";


// 3. TELAS ONBOARDING

import ChooseSponsorScreen from "./src/onboarding/ChooseSponsorScreen";

import FindSponsorScreen from "./src/onboarding/FindSponsorScreen";

import FirstAccessScreen from "./src/onboarding/FirstAccessScreen";

import ForgotPasswordScreen from "./src/onboarding/ForgotPasswordScreen";

import HasSponsorScreen from "./src/onboarding/HasSponsorScreen";

import LoginDiamondScreen from "./src/onboarding/LoginDiamondScreen";

import PaymentScreen from "./src/onboarding/PaymentScreen";

import RunnerRegisterScreen from "./src/onboarding/RunnerRegisterScreen";

import SelectProfileScreen from "./src/onboarding/SelectProfileScreen";

import SponsorDataScreen from "./src/onboarding/SponsorDataScreen";

import WelcomeScreen from "./src/onboarding/WelcomeScreen";


// 4. ÁREA LOGADA

import OfficeDrawer from "./src/screens/office/OfficeDrawer";

import PackagesScreen from "./src/screens/office/PackagesScreen";


const Stack = createNativeStackNavigator();



function AppContent() {


  const themeContext = useTheme();


  const [session, setSession] = useState(undefined);


  const [showSplash, setShowSplash] = useState(true);



  // SPLASH

  useEffect(() => {

    const timer = setTimeout(() => {

      setShowSplash(false);

    },5000);


    return () => clearTimeout(timer);


  },[]);





  // CONTROLE DE SESSÃO

  useEffect(() => {


    const check = async(nextSession)=>{


      if(!nextSession?.user?.id){

        setSession(null);

        return;

      }



      const {data}=await supabase

      .from("profiles")

      .select("is_active,status")

      .eq("id",nextSession.user.id)

      .maybeSingle();




      const status=String(
        data?.status || ""
      ).toUpperCase();



      const blocked =
        status==="EXCLUIDO" ||
        status==="BLOQUEADO";



      setSession(
        blocked
        ? null
        : nextSession
      );


    };




    supabase.auth
    .getSession()
    .then(({data:{session}})=>{

      check(session);

    });





    const {
      data:{subscription}
    }=
    supabase.auth
    .onAuthStateChange(
      (_event,nextSession)=>{

        check(nextSession);

      }
    );




    return()=>{

      subscription?.unsubscribe();

    };



  },[]);





  // SPLASH

  if(showSplash){

    return(

      <View

        style={{

          flex:1,

          backgroundColor:"#0c3c74",

          justifyContent:"center",

          alignItems:"center",

        }}

      >


        <Image

          source={
            require("./src/assets/images/logodiamond.png")
          }

          style={{
            width:140,
            height:140,
            marginBottom:20
          }}

          resizeMode="contain"

        />



        <Text

          style={{

            color:"#FFD700",

            fontSize:22,

            fontWeight:"900",

            letterSpacing:3,

            marginBottom:20,

          }}

        >

          DIAMOND RUNNER

        </Text>



        <ActivityIndicator

          size="large"

          color="#2c94bc"

        />



        <Text

          style={{

            color:"#a4bccc",

            marginTop:16,

            fontSize:12,

            letterSpacing:1,

          }}

        >

          CARREGANDO...

        </Text>



      </View>

    );

  }



  // AGUARDA TEMA E LOGIN

  if(
    !themeContext ||
    !themeContext.theme ||
    session===undefined
  ){

    return(

      <View

        style={{

          flex:1,

          justifyContent:"center",

          alignItems:"center",

          backgroundColor:"#14508f",

        }}

      >

        <ActivityIndicator

          size="large"

          color="#2c94bc"

        />

      </View>

    );

  }



  const {
    theme,
    isDark
  }=themeContext;



  const navTheme={

    ...(isDark
      ? DarkTheme
      : DefaultTheme
    ),


    colors:{


      ...(isDark
        ? DarkTheme.colors
        : DefaultTheme.colors
      ),


      primary:"#2c94bc",

      background:theme.bg,

      card:theme.bg,

      text:theme.text,

      border:theme.border,


    }

  };
    return (

    <NavigationContainer theme={navTheme}>

      <StatusBar

        barStyle={
          isDark
          ? "light-content"
          : "dark-content"
        }

        backgroundColor="transparent"

        translucent

      />


<Stack.Navigator
screenOptions={({navigation}) => ({

  headerShown:true,

  headerTitle:"",

  headerBackTitle:"",

  headerTintColor:"#FFD700",

  headerStyle:{
    backgroundColor:"#0c3c74",
  },

  animation:"fade",

  contentStyle:{
    backgroundColor:theme.bg,
  },

})}

>


        {
          session
          ?

          (

            <Stack.Group>


              <Stack.Screen

                name="OfficeDrawer"

                component={OfficeDrawer}

                options={{

                  headerShown:false,

                }}

              />


            </Stack.Group>


          )


          :

          (

            <Stack.Group>


              <Stack.Screen

                name="Welcome"

                component={WelcomeScreen}

              />



              <Stack.Screen

                name="LoginDiamond"

                component={LoginDiamondScreen}

              />



              <Stack.Screen

                name="SelectProfile"

                component={SelectProfileScreen}

              />



              <Stack.Screen

                name="ForgotPassword"

                component={ForgotPasswordScreen}

              />



              <Stack.Screen

                name="ChooseSponsor"

                component={ChooseSponsorScreen}

              />



              <Stack.Screen

                name="HasSponsor"

                component={HasSponsorScreen}

              />



              <Stack.Screen

                name="SponsorData"

                component={SponsorDataScreen}

              />


            </Stack.Group>

          )

        }





        <Stack.Group

          screenOptions={{

            animation:"slide_from_right"

          }}

        >



          <Stack.Screen

            name="FirstAccess"

            component={FirstAccessScreen}

          />




          <Stack.Screen

            name="PackagesScreen"

            component={PackagesScreen}

          />




          <Stack.Screen

            name="FindSponsor"

            component={FindSponsorScreen}

          />




          <Stack.Screen

            name="RunnerRegister"

            component={RunnerRegisterScreen}

          />




          <Stack.Screen

            name="PaymentScreen"

            component={PaymentScreen}

          />



        </Stack.Group>



      </Stack.Navigator>


    </NavigationContainer>


  );

}




function App(){

  return(

    <SafeAreaProvider>


      <CountryProvider>


        <LanguageProvider>


          <ThemeProvider>


            <AppContent/>


          </ThemeProvider>


        </LanguageProvider>


      </CountryProvider>


    </SafeAreaProvider>

  );

}



registerRootComponent(App);


export default App;