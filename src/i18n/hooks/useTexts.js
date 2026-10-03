import { useContext } from "react";
import { CountryContext } from "../context/CountryContext";

import {
  commonTexts,
  chooseSponsorTexts,
  dashboardTexts,
  earningsTexts,
  forgotPasswordTexts,
  findSponsorTexts,
  firstAccessTexts,
  hasSponsorTexts,
  loginTexts,
  marketingTexts,
  networkTexts,
  newsTexts,
  officeTexts,
  packagesTexts,
  paymentTexts,
  progressTexts,
  prowayTexts,
  runnerRegisterTexts,
  runnerLoginTexts,
  welcomeTexts,
  profileTexts,
  settingsTexts,
  diamondStoreTexts,
  gpsTexts,
  withdrawTexts,
  aboutTexts,
  termsTexts,
  privacyTexts,
  appsTexts,
  imageUploadTexts,
} from "./texts";

export function useTexts(screen) {
  const context = useContext(CountryContext);
  const lang = context?.country || "BR";

  const getSafeText = (textGroup) => {
    if (!textGroup) return {};
    return textGroup[lang] || textGroup["BR"] || {};
  };

  let textGroup;

  switch (screen) {
    case "common":
      textGroup = {};
      break;
    case "welcome":
      textGroup = welcomeTexts;
      break;
    case "firstAccess":
      textGroup = firstAccessTexts;
      break;
    case "chooseSponsor":
      textGroup = chooseSponsorTexts;
      break;
    case "findSponsor":
      textGroup = findSponsorTexts;
      break;
    case "hasSponsor":
      textGroup = hasSponsorTexts;
      break;
    case "runnerRegister":
      textGroup = runnerRegisterTexts;
      break;
    case "payment":
      textGroup = paymentTexts;
      break;
    case "login":
      textGroup = loginTexts;
      break;
    case "runnerLogin":
      textGroup = runnerLoginTexts;
      break;
    case "forgotPassword":
      textGroup = forgotPasswordTexts;
      break;
    case "office":
      textGroup = officeTexts;
      break;
    case "profile":
      textGroup = profileTexts;
      break;
    case "settings":
      textGroup = settingsTexts;
      break;
    case "dashboard":
      textGroup = dashboardTexts;
      break;
    case "earnings":
      textGroup = earningsTexts;
      break;
    case "marketing":
      textGroup = marketingTexts;
      break;
    case "network":
      textGroup = networkTexts;
      break;
    case "news":
      textGroup = newsTexts;
      break;
    case "packages":
      textGroup = packagesTexts;
      break;
    case "progress":
      textGroup = progressTexts;
      break;
    case "proway":
      textGroup = prowayTexts;
      break;
    case "diamondStore":
      textGroup = diamondStoreTexts;
      break;
    case "gps":
      textGroup = gpsTexts;
      break;
    case "withdraw":
      textGroup = withdrawTexts;
      break;
    case "about":
      textGroup = aboutTexts;
      break;
    case "terms":
      textGroup = termsTexts;
      break;
    case "privacy":
      textGroup = privacyTexts;
      break;
    case "apps":
      textGroup = appsTexts;
      break;
    case "imageUpload":
      textGroup = imageUploadTexts;
      break;
    default:
      return {};
  }

  return {
    ...getSafeText(commonTexts),
    ...getSafeText(textGroup),
  };
}
