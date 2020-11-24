import env from "./env";

export function metaTags() {
  return {
    name: "site name",
    baseUrl:
      env.mode === "dev"
        ? "http://localhost:4200/"
        : "https://www.example.com/",
    link: "https://www.example.com/",
    description: "",
    "content-language": "ar,en",
    image: { src: `/assets/site-image.webp` },
    twitter: {
      site: "twitter_account",
      "site:id": "twitter_account"
      //todo: app:name:iphone,...
    },
    //name will be added to title via meta.service
    title: "site title"
  };
}

export const ADSENSE =
  env.mode === "dev"
    ? "ca-app-pub-3940256099942544" //for test https://developers.google.com/admob/android/test-ads
    : "ca-app-pub-3940256099942544"; //replace with your real adsense account
