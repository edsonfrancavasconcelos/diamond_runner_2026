import { useContext } from "react";
import { CountryContext } from "../context/CountryContext"; 

import {
  chooseSponsorTexts,
  findSponsorTexts,
  firstAccessTexts,
  hasSponsorTexts,
  loginTexts,
  officeTexts,
  paymentTexts,
  runnerRegisterTexts,
  welcomeTexts,
  profileTexts, 
} from "./texts";

export function useTexts(screen) {
  const context = useContext(CountryContext);
  const lang = context?.country || "BR"; 

  const getSafeText = (textGroup) => {
    if (!textGroup) return {}; 
    return textGroup[lang] || textGroup["BR"] || {};
  };

  switch (screen) {
    case "welcome":
      return getSafeText(welcomeTexts);
    case "firstAccess":
      return getSafeText(firstAccessTexts);
    case "chooseSponsor":
      return getSafeText(chooseSponsorTexts);
    case "findSponsor":
      return getSafeText(findSponsorTexts);
    case "hasSponsor":
      return getSafeText(hasSponsorTexts);
    case "runnerRegister":
      return getSafeText(runnerRegisterTexts);
    case "payment":
      return getSafeText(paymentTexts);
    case "login":
      return getSafeText(loginTexts);
    case "office":
      return getSafeText(officeTexts);
    case "profile":
      return getSafeText(profileTexts);
    default:
      return {};
  }
}
