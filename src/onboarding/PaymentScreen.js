// Local: src/onboarding/PaymentScreen.js

import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useMemo, useState } from "react";

import {
  Linking,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";

import { createCheckoutSession } from "../services/checkoutService";


const PALETTE = {
  primary: "#2c94bc",
  dark: "#0c3c74",
  gold: "#FFD700",
  success: "#4CAF50",
};


export default function PaymentScreen() {

  const navigation = useNavigation();
  const route = useRoute();


  const params = route.params || {};


  const {
    type,
    planName,
    email,
    amount
  } = params;


  const [checkoutStarted, setCheckoutStarted] = useState(false);
  const [loading, setLoading] = useState(false);



  /*
    Normaliza o plano recebido
  */
  const planInfo = useMemo(() => {


    const rawPlan = String(
      planName ||
      type ||
      ""
    ).toLowerCase();



    let name = "AFILIADO";
    let price = 99;



    if (rawPlan.includes("elite")) {

      name = "ELITE";
      price = 1599;

    } else if (rawPlan.includes("prime")) {

      name = "PRIME";
      price = 799;

    } else if (
      rawPlan.includes("builder") ||
      rawPlan.includes("distributor") ||
      rawPlan.includes("distribuidor")
    ) {

      name = "BUILDER";
      price = 299;

    } else if (
      rawPlan.includes("afiliado") ||
      rawPlan.includes("affiliate")
    ) {

      name = "AFILIADO";
      price = 99;

    } else if (Number(amount) > 0) {

      price = Number(amount);

    }



    return {
      name,
      price
    };


  }, [
    type,
    planName,
    amount
  ]);





  async function openStripe() {


    if (loading) return;



    const userEmail = email
      ?.trim()
      ?.toLowerCase();



    if (!userEmail) {

      alert(
        "Informe seu email antes de continuar."
      );

      return;
    }



    if (!planInfo.price || planInfo.price <= 0) {

      alert(
        "Valor do plano inválido."
      );

      return;
    }




    setLoading(true);



    try {


      const payload = {

        amount: Number(planInfo.price),

        plan: planInfo.name,

        planName: planInfo.name,

      };



      console.log(
        "🚀 Enviando checkout:",
        {
          ...payload,
          email:userEmail
        }
      );




      const response =
        await createCheckoutSession(

          planInfo.name,

          userEmail,

          payload

        );



      const url = response?.url;



      if (!url) {

        throw new Error(
          "Stripe não retornou URL."
        );

      }




      setCheckoutStarted(true);



      if (
        typeof window !== "undefined" &&
        window.open
      ) {

        window.open(
          url,
          "_blank"
        );


      } else {


        await Linking.openURL(url);

      }



    } catch(error) {


      console.error(
        "❌ Checkout erro:",
        error
      );


      const message =
        error?.message ||
        "Falha ao abrir pagamento.";



      if (
        typeof window !== "undefined"
      ) {

        window.alert(message);

      }


    } finally {

      setLoading(false);

    }


  }





  return (

    <ScrollView
      contentContainerStyle={styles.container}
    >

      <StatusBar
        barStyle="light-content"
      />


      <View style={styles.header}>


        <Ionicons
          name="diamond"
          size={60}
          color={PALETTE.gold}
        />


        <Text style={styles.title}>
          FINALIZAR ATIVAÇÃO
        </Text>



        <Text style={styles.planName}>
          {planInfo.name}
        </Text>



        <Text style={styles.priceText}>
          R$ {planInfo.price.toFixed(2)}
        </Text>



        {
          email &&
          <Text style={styles.emailText}>
            {email}
          </Text>
        }



      </View>





      <View style={styles.actions}>


        <TouchableOpacity
          style={styles.payButton}
          onPress={openStripe}
          disabled={loading}
        >

          <Text style={styles.btnText}>

            {
              loading
              ?
              "ABRINDO STRIPE..."
              :
              "PAGAR COM STRIPE"
            }

          </Text>


        </TouchableOpacity>





        <TouchableOpacity

          style={[
            styles.payButton,
            styles.secondaryButton
          ]}

          disabled={!checkoutStarted}

          onPress={() =>
            navigation.navigate(
              "LoginDiamond",
              {
                email
              }
            )
          }

        >

          <Text style={styles.btnText}>
            JÁ PAGUEI / IR PARA LOGIN
          </Text>


        </TouchableOpacity>



      </View>



    </ScrollView>

  );

}




const styles = StyleSheet.create({


  container:{
    flexGrow:1,
    backgroundColor:PALETTE.dark,
    padding:30,
    justifyContent:"center",
  },


  header:{
    alignItems:"center",
    marginBottom:40,
  },


  title:{
    color:"#FFF",
    fontSize:22,
    fontWeight:"900",
    marginTop:10,
  },


  planName:{
    color:PALETTE.primary,
    fontSize:16,
    fontWeight:"bold",
  },


  priceText:{
    color:PALETTE.gold,
    fontSize:40,
    fontWeight:"900",
    marginTop:10,
  },


  emailText:{
    color:"#a4bccc",
    marginTop:8,
    fontSize:12,
  },


  actions:{
    width:"100%",
    gap:12,
  },


  payButton:{
    backgroundColor:PALETTE.primary,
    padding:20,
    borderRadius:15,
    alignItems:"center",
    width:"100%",
  },


  secondaryButton:{
    backgroundColor:"transparent",
    borderWidth:1,
    borderColor:PALETTE.primary,
  },


  btnText:{
    color:"#FFF",
    fontWeight:"bold",
    fontSize:16,
  },


});