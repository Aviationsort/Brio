export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  date: string;
  url: string;
  source: string;
  category: 'Centrist' | 'Left-wing' | 'Right-wing' | 'State-Controlled';
  imageUrl?: string;
  country?: string;
  topicCountries?: string[];
  _ts?: number;
}

export interface NewsSource {
  name: string;
  status: 'success' | 'failed';
  url: string;
  category: 'Centrist' | 'Left-wing' | 'Right-wing' | 'State-Controlled';
  country?: string;
  error?: string;
  reason?: string;
  articleCount?: number;
  checkedAt?: string;
}

export interface FeedData {
  url: string;
  category: 'Centrist' | 'Left-wing' | 'Right-wing' | 'State-Controlled';
}

export const RSS_CREDITS: Record<string, string> = {
  'https://www.aeroroutes.com/?format=rss': 'AeroRoutes',
  'https://www.aero-news.net/news/rssCOMANW.xml': 'Aero-News',
  'https://samchui.com/feed/': 'SamChui',
  'https://simpleflying.com/feed/': 'Simple Flying',
  'https://theaviationist.com/feed/': 'The Aviationist',
  'https://avgeekery.com/feed/': 'AvGeekery',
  'https://australianaviation.com.au/feed/': 'Australian Aviation',
  'https://feeds.feedburner.com/Ex-yuAviationNews': 'Ex-Yu Aviation News',
  'https://generalaviationnews.com/feed/': 'General Aviation News',
  'https://www.airbus.com/en/rss-all-feeds/15571?tid=15571&fid=29711': 'Airbus',
  'https://runwaygirlnetwork.com/feed/': 'Runway Girl Network',
  'https://www.aviationpros.com/rss': 'Aviation Pros',
  'https://www.aviationtoday.com/feed/': 'Aviation Today',
  'https://www.flightglobal.com/feed/': 'Flight Global',
  'https://www.thehimalayantimes.com/rssFeed/11/44': 'The Himalayan Times',
  'https://news.un.org/feed/subscribe/en/news/all/rss.xml': 'UN News',
  'https://rss.dw.com/atom/rss-en-all': 'DW',
  'https://feeds.abcnews.com/abcnews/politicsheadlines': 'ABC News',
  'https://feeds.abcnews.com/abcnews/usheadlines': 'ABC News',
  'https://feeds.abcnews.com/abcnews/internationalheadlines': 'ABC News',
  'https://www.cbc.ca/webfeed/rss/rss-canada': 'CBC',
  'https://www.cbc.ca/webfeed/rss/rss-world': 'CBC',
  'https://www.cbsnews.com/latest/rss/politics': 'CBS News',
  'https://www.cbsnews.com/latest/rss/world': 'CBS News',
  'https://rthk.hk/rthk/news/rss/e_expressnews_einternational.xml': 'RTHK',
  'https://news.google.com/rss/search?q=when:24h+allinurl:bloomberg.com&hl=en-US&gl=US&ceid=US:en': 'Bloomberg',
  'https://indianexpress.com/section/politics/feed/': 'Indian Express',
  'https://www.thehimalayantimes.com/rssFeed/27': 'The Himalayan Times',
  'https://vietnamnews.vn/rss/politics-laws.rss': 'Vietnam News',
  'https://vietnamnews.vn/rss/world.rss': 'Vietnam News',
  'https://feeds.feedburner.com/ndtvnews-world-news': 'NDTV',
  'https://natowatch.org/news.xml': 'NATO Watch',
  'https://en.yenisafak.com/rss-feeds?category=/politics': 'Yeni Safak',
  'https://egyptianstreets.com/feed/': 'Egyptian Streets',
  'https://www.independent.co.uk/news/world/rss': 'The Independent',
  'https://www.independent.co.uk/news/uk/rss': 'The Independent',
  'https://indianexpress.com/section/news-today/feed/': 'Indian Express',
  'https://www.lemonde.fr/en/international/rss_full.xml': 'Le Monde',
  'http://www.xinhuanet.com/english/rss/worldrss.xml': 'Xinhua',
  'https://thediplomat.com/feed/': 'The Diplomat',
  'https://www.the961.com/feed/': 'The 961',
  'https://www.japantimes.co.jp/feed/': 'Japan Times',
  'https://www.thenation.com/feed/?post_type=article': 'The Nation',
  'https://cpj.org/feed/atom/': 'Committee to Protect Journalists',
  'https://www.hindustantimes.com/feeds/rss/world-news/rssfeed.xml': 'Hindustan Times',
  'https://www.indiatoday.in/rss/1206577': 'India Today',
  'https://www.nna-leb.gov.lb/en/rss': 'NNA Lebanon',
  'https://feeds.bbci.co.uk/news/rss.xml': 'BBC News',
  'https://english.alarabiya.net/feed/rss2/en/News.xml': 'Al Arabiya',
  'https://www.nbcnews.com/rss': 'NBC News',
  'https://www.politicshome.com/rss': 'Politics Home',
  'https://www.europarl.europa.eu/rss/doc/press-releases/en.xml': 'European Parliament',
  'https://www.france24.com/en/rss': 'France 24',
  'https://www.euronews.com/rss?level=theme&name=news': 'Euronews',
  'https://feeds.thelocal.com/rss': 'The Local',
  'https://www.albawaba.com/rss/all': 'Al Bawaba',
  'https://www.middleeasteye.net/rss': 'Middle East Eye',
  'https://www.scmp.com/rss/5/feed': 'SCMP',
  'https://www.scmp.com/rss/318198/feed': 'SCMP',
  'https://www.scmp.com/rss/318206/feed': 'SCMP',
  'https://www.themoscowtimes.com/rss/news': 'Moscow Times',
  'https://www.rt.com/rss/': 'RT',
  'http://feeds.skynews.com/feeds/rss/world.xml': 'Sky News',
  'http://feeds.skynews.com/feeds/rss/politics.xml': 'Sky News',
  'https://globalnews.ca/world/feed/': 'Global News',
  'https://globalnews.ca/politics/feed/': 'Global News',
  'https://globalnews.ca/canada/feed/': 'Global News',
  'https://balkaninsight.com/feed': 'Balkan Insight',
  'https://globalvoices.org/feed/': 'Global Voices',
  'https://crisisgroup.org/categories.xml': 'International Crisis Group',
  'https://theconversation.com/articles.atom': 'The Conversation',
  'https://moxie.foxnews.com/google-publisher/world.xml': 'Fox News',
  'https://moxie.foxnews.com/google-publisher/us.xml': 'Fox News',
  'https://www.canberratimes.com.au/rss.xml': 'Canberra Times',
  'https://www.9news.com.au/rss': '9 News Australia',
  'https://www.ft.com/rss/home': 'Financial Times',
  'https://eng.globalaffairs.ru/feed/': 'Global Affairs',
  'https://hungarytoday.hu/feed/': 'Hungary Today',
  'https://www.budapesttimes.hu/feed/': 'Budapest Times',
  'https://english.enabbaladi.net/feed/': 'Enab Baladi',
  'https://syrianews.cc/feed/': 'Syria News',
  'https://www.cyprustodayonline.com/rss/category/south-cyprus': 'Cyprus Today',
  'https://www.cyprustodayonline.com/rss/category/news': 'Cyprus Today',
  'https://www.cyprustodayonline.com/rss/category/cyprus': 'Cyprus Today',
  'https://www.lbcgroup.tv/Rss/News/en/8/lebanon-news': 'LBC',
  'https://www.lbcgroup.tv/Rss/News/en/125/world-news': 'LBC',
  'https://www.executive-magazine.com/feed': 'Executive Magazine',
  'https://notesfrompoland.com/rss/': 'Notes from Poland',
  'https://api.axios.com/feed/': 'Axios',
  'https://www.buzzfeed.com/politics.xml': 'BuzzFeed',
  'http://government.ru/en/all/rss/': 'Government.ru',
  'https://www.arabfinance.com/en/rss/rssbycat/6': 'Arab Finance',
  'https://sputnikglobe.com/export/rss2/archive/index.xml': 'Sputnik Globe',
  'https://www.gbnews.com/feeds/politics.rss': 'GB News',
  'https://www.gbnews.com/feeds/news.rss': 'GB News',
  'https://www.pm.gc.ca/en/news.rss': 'PM of Canada',
  'https://www.cbc.ca/webfeed/rss/rss-politics': 'CBC Politics',
  'https://www.ipolitics.ca/feed/': 'iPolitics',
  'https://rabble.ca/feed/': 'Rabble',
  'https://looniepolitics.com/feed/': 'Loonie Politics',
  'https://angusreid.org/feed/': 'Angus Reid',
  'https://canadiandimension.com/feeds/articles': 'Canadian Dimension',
  'https://broadbentinstitute.ca/updates/feed/': 'Broadbent Institute',
  'https://albertapolitics.ca/feed/': 'Alberta Politics',
  'https://www.ekospolitics.com/index.php/feed/': 'Ekos Politics',
  'https://www.canadianprogressiveworld.com/feed/': 'Canadian Progressive World',
  'https://nationalpost.com/category/news/politics/feed.xml': 'National Post',
  'https://www.policyalternatives.ca/feed/': 'Policy Alternatives',
  'https://thewalrus.ca/category/current-affairs/politics/feed/': 'The Walrus',
  'https://www.thestar.com/search/?f=rss&t=article&c=politics&l=50&s=start_time&sd=desc': 'Toronto Star',
  'https://theconversation.com/ca/politics/articles.atom': 'The Conversation CA',
  'https://www.nationalobserver.com/taxonomy/term/4/rss': 'National Observer',
  'https://in-sights.ca/feed/': 'In-Sights',
  'https://calgaryherald.com/category/news/politics/feed.xml': 'Calgary Herald',
  'https://edmontonjournal.com/category/news/politics/feed.xml': 'Edmonton Journal',
  'https://rss.politico.com/politics-news.xml': 'Politico',
  'https://travel.state.gov/_res/rss/TAsTWs.xml': 'US State Department',
  'https://www.pbs.org/newshour/feeds/rss/politics': 'PBS NewsHour',
  'https://www.pbs.org/newshour/feeds/rss/headlines': 'PBS NewsHour',
  'https://www.war.gov/DesktopModules/ArticleCS/RSS.ashx?max=10&ContentType=1&Site=945': 'War.gov',
  'https://rss.nytimes.com/services/xml/rss/nyt/World.xml': 'NYTimes',
  'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml': 'NYTimes',
  'https://www.af.mil/DesktopModules/ArticleCS/RSS.ashx?ContentType=1&Site=1&isdashboardselected=0&max=20': 'US Air Force',
  'https://www.mprnews.org/feed/politics': 'MPR News',
  'https://feeds.content.dowjones.io/public/rss/RSSWorldNews': 'Dow Jones',
  'https://feeds.content.dowjones.io/public/rss/socialpoliticsfeed': 'Dow Jones',
  'https://www.foreignaffairs.com/rss.xml': 'Foreign Affairs',
  'https://www.voanews.com/api/zqboml-vomx-tpeivmy': 'VOA News',
  'https://feeds.feedburner.com/Bernewscom': 'Bernews',
  'https://www.royalgazette.com/feeds/': 'Royal Gazette',
  'https://www.consilium.europa.eu/en/rss/pressreleases.ashx': 'European Council',
  'https://officialblogofunio.com/feed/': 'Official Blog of Unio',
  'https://www.europeanlawblog.eu/rss.xml': 'European Law Blog',
  'https://ec.europa.eu/eurostat/en/search?p_p_id=estatsearchportlet_WAR_estatsearchportlet&p_p_lifecycle=2&p_p_state=maximized&p_p_mode=view&p_p_resource_id=atom&_estatsearchportlet_WAR_estatsearchportlet_collection=CAT_PREREL': 'Eurostat',
  'https://ecfr.eu/feed/': 'ECFR',
  'https://feeds.feedburner.com/ekathimerini/sKip': 'Ekathimerini',
  'https://www.thenationalherald.com/feed/': 'The National Herald',
  'https://www.crisisgroup.org/rss': 'International Crisis Group',
  'https://www.mfa.gov.tr/en.rss.mfa?ad9093da-8e71-4678-a1b6-05f297baadc4': 'Turkish MFA',
  'https://www.msf.org/rss/all': 'MSF',
  'https://buenosairesherald.com/feed/atom': 'Buenos Aires Herald',
  'https://www.batimes.com.ar/feed': 'Buenos Aires Times',
  'http://news.am/eng/rss/': 'News.am',
  'http://en.1in.am/feed': '1in.am',
  'http://en.aravot.am/feed/': 'Aravot',
  'https://stickers.panarmenian.net/feeds/eng/news/': 'PanARMENIAN',
  'https://armenianweekly.com/feed/': 'Armenian Weekly',
  'https://hetq.am/en/rss': 'Hetq',
  'https://asunciontimes.com/feed/': 'Asuncion Times',
  'https://en.mercopress.com/rss/politics': 'MercoPress',
  'https://en.mercopress.com/rss/paraguay': 'MercoPress',
  'https://en.mercopress.com/rss/': 'MercoPress',
  'https://feeds.washingtonpost.com/rss/world': 'Washington Post',
  'https://www.washingtonpost.com/arcio/rss/category/politics/': 'Washington Post',
  'https://www.washingtontimes.com/rss/headlines/news/politics/': 'Washington Times',
  'https://www.cbsnews.com/latest/rss/us': 'CBS News',
  'https://www.navy.mil/DesktopModules/ArticleCS/RSS.ashx?ContentType=1&Site=1067&max=10': 'US Navy',
  'https://www.usnews.com/rss/news': 'US News',
  'https://news.un.org/feed/subscribe/en/news/region/global/feed/rss.xml': 'UN News',
  'https://mexiconewsdaily.com/feed/': 'Mexico News Daily',
  'https://en.granma.cu/feed': 'Granma',
  'https://havanatimes.org/feed/': 'Havana Times',
  'http://www.wto.org/library/rss/latest_news_e.xml': 'WTO',
  'https://icenews.is/news/politics/feed/': 'Iceland Review',
  'https://allafrica.com/tools/headlines/rdf/latest/headlines.rdf': 'AllAfrica',
  'https://www.novinite.com/services/news_rdf.php': 'Novinite',
  'https://feeds.feedburner.com/TheSofiaGlobe': 'The Sofia Globe',
  'https://informante.web.na/?feed=rss2': 'Informante',
  'https://namibiadailynews.info/feed/': 'Namibia Daily News',
  'https://www.namibiansun.com/rssFeed/137': 'Namibian Sun',
  'https://www.namibiansun.com/rssFeed/145': 'Namibian Sun',
  'https://www.namibiansun.com/rssFeed/-55': 'Namibian Sun',
  'https://www.africanews.com/feed/rss': 'Africa News',
  'https://acturdc.com/feed/': 'ACTURDC',
  'https://feeds.northkoreatimes.com/rss/08aysdf7tga9s7f7': 'North Korea Times',
  'https://www.38north.org/feed/': '38 North',
  'https://www.dailynk.com/english/feed/': 'Daily NK',
  'https://www.rferl.org/api/zbqiml-vomx-tpeqkmy': 'RFE/RL',
  'https://www.moldpres.md/config/rss.php?lang=eng': 'Moldpres',
  'https://www.tehrantimes.com/rss/tp/698': 'Tehran Times',
  'https://www.tehrantimes.com/rss': 'Tehran Times',
  'https://en.irna.ir/rss': 'IRNA',
  'https://en.radiofarda.com/api/zp_qmtl-vomx-tpe_bimr': 'Radio Farda',
  'https://en.isna.ir/rss/tp/13': 'ISNA',
  'https://en.isna.ir/rss': 'ISNA',
  'https://www.azernews.az/feed.php': 'AzerNews',
  'https://www.b92.net/rss/b92/english': 'B92',
  'https://www.stat.gov.rs/en-us/RSS': 'Stat.gov.rs',
  'https://ottawacitizen.com/feed': 'Ottawa Citizen',
  'https://theprovince.com/feed': 'The Province',
  'https://moxie.foxnews.com/google-publisher/politics.xml': 'Fox News',
  'http://feeds.reuters.com/Reuters/PoliticsNews': 'Reuters',
  'https://www.realwire.com/rss/feeds.asp?cat=Politics': 'RealWire',
  'http://www.msnbc.com/feeds/latest': 'MSNBC',
  'https://crittendenpress.blogspot.com/feeds/posts/default?alt=rss': 'Crittenden Press',
  'https://www.biziday.ro/feed/': 'Biziday',
  'https://www.sabanew.net/rss.php?lang=en': 'Saba News',
  'https://english.alahednews.news/rss/541': 'Al Ahed News',
  'https://jordantimes.com/rss-feed/45': 'Jordan Times',
  'https://jordantimes.com/rss-feed/47': 'Jordan Times',
  'https://thearabianpost.com/feed/': 'The Arabian Post',
  'https://www.dubaichronicle.com/feed/': 'Dubai Chronicle',
  'https://www.aa.com.tr/en/rss/default?cat=live': 'AA',
  'https://vlada.gov.hr/RSS?id=14956': 'Croatian Government',
  'https://n1info.ba/feed/': 'N1info',
  'https://www.palestinechronicle.com/category/articles/feed/': 'Palestine Chronicle',
  'https://www.israelnationalnews.com/Rss.aspx': 'Israel National News',
  'https://www.haaretz.com/srv/haaretz-latest-headlines': 'Haaretz',
  'https://feeds.feedburner.com/arabistdotnet': 'Arabist.Net',
  'https://dohanews.co/feed/': 'Doha News',
  'https://qna.org.qa/en/Pages/RSS-Feeds/Miscellaneous-International': 'QNA',
  'https://www.bizbahrain.com/feed/': 'BizBahrain',
  'https://saudiexpatriate.com/feed/': 'Saudi Expatriate',
  'https://www.arabnews.com/cat/3/rss.xml': 'Arab News',
  'https://www.arabnews.com/cat/1/rss.xml': 'Arab News',
  'https://www.arabtimesonline.com/rssFeed/47/': 'Arab Times',
  'https://www.omanobserver.om/rssFeed/55': 'Oman Observer',
  'https://en.naqd.media/feed/': 'Naqd Media',
};

const ALT_URLS: Record<string, string> = {
  'https://tass.com/rss/v2.xml': 'https://tass.com/rss.xml',
  'https://vietnamnews.vn/rss/politics-laws.rss': 'https://vietnamnews.vn/rss/',
  'https://vietnamnews.vn/rss/world.rss': 'https://vietnamnews.vn/rss/',
  'https://www.cbsnews.com/latest/rss/politics': 'https://www.cbsnews.com/rss/',
  'https://www.cbsnews.com/latest/rss/world': 'https://www.cbsnews.com/rss/',
  'https://www.cbsnews.com/latest/rss/us': 'https://www.cbsnews.com/rss/',
  'https://www.independent.co.uk/news/world/rss': 'https://www.independent.co.uk/rss',
  'https://www.independent.co.uk/news/uk/rss': 'https://www.independent.co.uk/rss',
  'https://natowatch.org/news.xml': 'https://natowatch.org/feed/',
  'https://news.google.com/rss/search?q=when:24h+allinurl:bloomberg.com&hl=en-US&gl=US&ceid=US:en': 'https://feeds.bloomberg.com/markets/stocks/rss',
  'https://english.alarabiya.net/feed/rss2/en/News.xml': 'https://english.alarabiya.net/rss/',
  'https://crisisgroup.org/categories.xml': 'https://www.crisisgroup.org/feed/',
  'https://www.9news.com.au/rss': 'https://www.9news.com.au/feed/',
  'https://english.enabbaladi.net/feed/': 'https://english.enabbaladi.net/en/feed/',
  'https://www.lbcgroup.tv/Rss/News/en/8/lebanon-news': 'https://www.lbcgroup.tv/rss/news/en/8/lebanon-news',
  'https://www.lbcgroup.tv/Rss/News/en/125/world-news': 'https://www.lbcgroup.tv/rss/news/en/125/world-news',
  'https://sputnikglobe.com/export/rss2/archive/index.xml': 'https://sputnikglobe.com/feed/',
  'https://eng.globalaffairs.ru/feed/': 'https://eng.globalaffairs.ru/rss/',
  'https://www.thestar.com/search/?f=rss&t=article&c=politics&l=50&s=start_time&sd=desc': 'https://www.thestar.com/content/thestar/feed.rss',
  'https://www.nationalobserver.com/taxonomy/term/4/rss': 'https://www.nationalobserver.com/rss',
  'https://www.themoscowtimes.com/rss/news': 'https://www.themoscowtimes.com/rss/',
  'https://www.washingtontimes.com/rss/headlines/news/politics/': 'https://www.washingtontimes.com/rss/',
  'https://www.namibiansun.com/rssFeed/-55': 'https://www.namibiansun.com/rss/',
  'https://en.radiofarda.com/api/zp_qmtl-vomx-tpe_bimr': 'https://www.rferl.org/api/zp_qmtl-vomx-tpe_bimr',
  'https://www.38north.org/feed/': 'https://www.38north.org/feed',
  'https://jordantimes.com/rss-feed/47': 'https://jordantimes.com/rss',
  'https://jordantimes.com/rss-feed/45': 'https://jordantimes.com/rss',
  'https://www.stat.gov.rs/en-us/RSS': 'https://www.stat.gov.rs/en-us/rss',
  'http://feeds.reuters.com/Reuters/PoliticsNews': 'https://www.reuters.com/rssFeed/topNews',
  'https://www.realwire.com/rss/feeds.asp?cat=Politics': 'https://www.realwire.com/rss/',
  'https://en.isna.ir/rss': 'https://www.isna.ir/rss/',
  'https://en.isna.ir/rss/tp/13': 'https://www.isna.ir/rss/',
  'https://www.palestinechronicle.com/category/articles/feed/': 'https://www.palestinechronicle.com/feed/',
  'https://www.arabnews.com/cat/1/rss.xml': 'https://www.arabnews.com/rss',
  'https://www.arabnews.com/cat/3/rss.xml': 'https://www.arabnews.com/rss',
  'https://broadbentinstitute.ca/updates/feed/': 'https://broadbentinstitute.ca/feed/',
  'https://www.mfa.gov.tr/en.rss.mfa?ad9093da-8e71-4678-a1b6-05f297baadc4': 'https://www.mfa.gov.tr/en.rss.mfa',
  'http://en.aravot.am/feed/': 'https://en.aravot.am/feed/',
  'https://en.granma.cu/feed': 'https://en.granma.cu/rss',
  'https://english.alahednews.news/rss/541': 'https://english.alahednews.news/rss/',
};

const FEEDS_DATA: FeedData[] = [
  {"url": "https://news.un.org/feed/subscribe/en/news/all/rss.xml", "category": "Centrist"},
  {"url": "https://www.aljazeera.com/xml/rss/all.xml", "category": "Left-wing"},
  {"url": "https://www.arabfinance.com/en/rss/rssbycat/6", "category": "Centrist"},
  {"url": "https://www.gbnews.com/feeds/politics.rss", "category": "Right-wing"},
  {"url": "https://www.gbnews.com/feeds/news.rss", "category": "Right-wing"},
  {"url": "https://www.dailynewsegypt.com/feed/", "category": "Centrist"},
  {"url": "https://thediplomat.com/feed/", "category": "Centrist"},
  {"url": "http://government.ru/en/all/rss/", "category": "State-Controlled"},
  {"url": "https://rss.dw.com/atom/rss-en-all", "category": "Centrist"},
  {"url": "https://feeds.abcnews.com/abcnews/politicsheadlines", "category": "Centrist"},
  {"url": "https://tass.com/rss/v2.xml", "category": "State-Controlled"},
  {"url": "https://feeds.abcnews.com/abcnews/usheadlines", "category": "Centrist"},
  {"url": "https://feeds.abcnews.com/abcnews/internationalheadlines", "category": "Centrist"},
  {"url": "https://www.cbc.ca/webfeed/rss/rss-canada", "category": "Left-wing"},
  {"url": "https://www.cbc.ca/webfeed/rss/rss-world", "category": "Left-wing"},
  {"url": "https://www.cbsnews.com/latest/rss/politics", "category": "Centrist"},
  {"url": "https://www.cbsnews.com/latest/rss/world", "category": "Centrist"},
  {"url": "https://rthk.hk/rthk/news/rss/e_expressnews_einternational.xml", "category": "State-Controlled"},
  {"url": "https://news.google.com/rss/search?q=when:24h+allinurl:bloomberg.com&hl=en-US&gl=US&ceid=US:en", "category": "Centrist"},
  {"url": "https://indianexpress.com/section/politics/feed/", "category": "Centrist"},
  {"url": "https://www.thehimalayantimes.com/rssFeed/27", "category": "Centrist"},
  {"url": "https://vietnamnews.vn/rss/politics-laws.rss", "category": "State-Controlled"},
  {"url": "https://vietnamnews.vn/rss/world.rss", "category": "State-Controlled"},
  {"url": "https://feeds.feedburner.com/ndtvnews-world-news", "category": "Left-wing"},
  {"url": "https://natowatch.org/news.xml", "category": "Left-wing"},
  {"url": "https://egyptianstreets.com/feed/", "category": "Centrist"},
  {"url": "https://www.independent.co.uk/news/world/rss", "category": "Left-wing"},
  {"url": "https://www.independent.co.uk/news/uk/rss", "category": "Left-wing"},
  {"url": "https://indianexpress.com/section/news-today/feed/", "category": "Centrist"},
  {"url": "https://www.lemonde.fr/en/international/rss_full.xml", "category": "Left-wing"},
  {"url": "http://www.xinhuanet.com/english/rss/worldrss.xml", "category": "State-Controlled"},
  {"url": "https://www.the961.com/feed/", "category": "Centrist"},
  {"url": "https://www.japantimes.co.jp/feed/", "category": "Centrist"},
  {"url": "https://www.thenation.com/feed/?post_type=article", "category": "Left-wing"},
  {"url": "https://cpj.org/feed/atom/", "category": "Centrist"},
  {"url": "https://www.hindustantimes.com/feeds/rss/world-news/rssfeed.xml", "category": "Centrist"},
  {"url": "https://www.indiatoday.in/rss/1206577", "category": "Centrist"},
  {"url": "https://www.nna-leb.gov.lb/en/rss", "category": "Centrist"},
  {"url": "https://feeds.bbci.co.uk/news/rss.xml", "category": "Centrist"},
  {"url": "https://english.alarabiya.net/feed/rss2/en/News.xml", "category": "Right-wing"},
  {"url": "https://www.nbcnews.com/rss", "category": "Left-wing"},
  {"url": "https://www.politicshome.com/news/rss", "category": "Centrist"},
  {"url": "https://www.europarl.europa.eu/rss/doc/press-releases/en.xml", "category": "Centrist"},
  {"url": "https://www.france24.com/en/rss", "category": "Centrist"},
  {"url": "https://www.euronews.com/rss?level=theme&name=news", "category": "Centrist"},
  {"url": "https://feeds.thelocal.com/rss", "category": "Centrist"},
  {"url": "https://www.albawaba.com/rss/all", "category": "Centrist"},
  {"url": "https://www.middleeasteye.net/rss", "category": "Left-wing"},
  {"url": "https://www.scmp.com/rss/5/feed", "category": "Centrist"},
  {"url": "https://www.scmp.com/rss/318198/feed", "category": "Centrist"},
  {"url": "https://www.scmp.com/rss/318206/feed", "category": "Centrist"},
  {"url": "https://www.themoscowtimes.com/rss/news", "category": "Centrist"},
  {"url": "https://www.rt.com/rss/", "category": "State-Controlled"},
  {"url": "http://feeds.skynews.com/feeds/rss/world.xml", "category": "Centrist"},
  {"url": "http://feeds.skynews.com/feeds/rss/politics.xml", "category": "Centrist"},
  {"url": "https://globalnews.ca/world/feed/", "category": "Centrist"},
  {"url": "https://globalnews.ca/politics/feed/", "category": "Centrist"},
  {"url": "https://globalnews.ca/canada/feed/", "category": "Centrist"},
  {"url": "https://balkaninsight.com/feed", "category": "Centrist"},
  {"url": "https://globalvoices.org/feed/", "category": "Left-wing"},
  {"url": "https://crisisgroup.org/categories.xml", "category": "Centrist"},
  {"url": "https://theconversation.com/articles.atom", "category": "Left-wing"},
  {"url": "https://moxie.foxnews.com/google-publisher/world.xml", "category": "Right-wing"},
  {"url": "https://moxie.foxnews.com/google-publisher/us.xml", "category": "Right-wing"},
  {"url": "https://en.yenisafak.com/rss-feeds?category=/politics", "category": "Right-wing"},
  {"url": "https://www.canberratimes.com.au/rss.xml", "category": "Centrist"},
  {"url": "https://www.9news.com.au/rss", "category": "Centrist"},
  {"url": "https://www.ft.com/rss/home", "category": "Centrist"},
  {"url": "https://eng.globalaffairs.ru/feed/", "category": "State-Controlled"},
  {"url": "https://hungarytoday.hu/feed/", "category": "Right-wing"},
  {"url": "https://www.budapesttimes.hu/feed/", "category": "Right-wing"},
  {"url": "https://english.enabbaladi.net/feed/", "category": "Centrist"},
  {"url": "https://syrianews.cc/feed/", "category": "Centrist"},
  {"url": "https://www.cyprustodayonline.com/rss/category/south-cyprus", "category": "Centrist"},
  {"url": "https://www.cyprustodayonline.com/rss/category/news", "category": "Centrist"},
  {"url": "https://www.cyprustodayonline.com/rss/category/cyprus", "category": "Centrist"},
  {"url": "https://www.shafaq.com/rss/en/Iraq", "category": "Centrist"},
  {"url": "https://www.iraq-businessnews.com/feed/", "category": "Centrist"},
  {"url": "https://www.lbcgroup.tv/Rss/News/en/8/lebanon-news", "category": "Centrist"},
  {"url": "https://www.lbcgroup.tv/Rss/News/en/125/world-news", "category": "Centrist"},
  {"url": "https://notesfrompoland.com/rss/", "category": "Centrist"},
  {"url": "https://api.axios.com/feed/", "category": "Centrist"},
  {"url": "https://www.buzzfeed.com/politics.xml", "category": "Left-wing"},
  {"url": "https://sputnikglobe.com/export/rss2/archive/index.xml", "category": "State-Controlled"},
  {"url": "https://www.pm.gc.ca/en/news.rss", "category": "Centrist"},
  {"url": "https://www.cbc.ca/webfeed/rss/rss-politics", "category": "Left-wing"},
  {"url": "https://www.ipolitics.ca/feed/", "category": "Centrist"},
  {"url": "https://rabble.ca/feed/", "category": "Left-wing"},
  {"url": "https://looniepolitics.com/feed/", "category": "Left-wing"},
  {"url": "https://angusreid.org/feed/", "category": "Centrist"},
  {"url": "https://canadiandimension.com/feeds/articles", "category": "Left-wing"},
  {"url": "https://broadbentinstitute.ca/updates/feed/", "category": "Left-wing"},
  {"url": "https://albertapolitics.ca/feed/", "category": "Centrist"},
  {"url": "https://www.ekospolitics.com/index.php/feed/", "category": "Centrist"},
  {"url": "https://www.canadianprogressiveworld.com/feed/", "category": "Left-wing"},
  {"url": "https://nationalpost.com/category/news/politics/feed.xml", "category": "Right-wing"},
  {"url": "https://www.policyalternatives.ca/feed/", "category": "Left-wing"},
  {"url": "https://thewalrus.ca/category/current-affairs/politics/feed/", "category": "Centrist"},
  {"url": "https://www.thestar.com/search/?f=rss&t=article&c=politics&l=50&s=start_time&sd=desc", "category": "Centrist"},
  {"url": "https://theconversation.com/ca/politics/articles.atom", "category": "Left-wing"},
  {"url": "https://www.nationalobserver.com/taxonomy/term/4/rss", "category": "Centrist"},
  {"url": "https://in-sights.ca/feed/", "category": "Centrist"},
  {"url": "https://calgaryherald.com/category/news/politics/feed.xml", "category": "Centrist"},
  {"url": "https://edmontonjournal.com/category/news/politics/feed.xml", "category": "Centrist"},
  {"url": "https://rss.politico.com/politics-news.xml", "category": "Centrist"},
  {"url": "https://travel.state.gov/_res/rss/TAsTWs.xml", "category": "Centrist"},
  {"url": "https://www.pbs.org/newshour/feeds/rss/politics", "category": "Centrist"},
  {"url": "https://www.pbs.org/newshour/feeds/rss/headlines", "category": "Centrist"},
  {"url": "https://www.war.gov/DesktopModules/ArticleCS/RSS.ashx?max=10&ContentType=1&Site=945", "category": "Centrist"},
  {"url": "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", "category": "Centrist"},
  {"url": "https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml", "category": "Centrist"},
  {"url": "https://www.af.mil/DesktopModules/ArticleCS/RSS.ashx?ContentType=1&Site=1&isdashboardselected=0&max=20", "category": "Centrist"},
  {"url": "https://www.mprnews.org/feed/politics", "category": "Centrist"},
  {"url": "https://feeds.content.dowjones.io/public/rss/RSSWorldNews", "category": "Centrist"},
  {"url": "https://feeds.content.dowjones.io/public/rss/socialpoliticsfeed", "category": "Centrist"},
  {"url": "https://news.un.org/feed/subscribe/en/news/region/global/feed/rss.xml", "category": "Centrist"},
  {"url": "https://www.foreignaffairs.com/rss.xml", "category": "Centrist"},
  {"url": "https://www.voanews.com/api/zqboml-vomx-tpeivmy", "category": "Centrist"},
  {"url": "https://feeds.washingtonpost.com/rss/world", "category": "Centrist"},
  {"url": "https://www.washingtonpost.com/arcio/rss/category/politics/", "category": "Centrist"},
  {"url": "https://www.washingtontimes.com/rss/headlines/news/politics/", "category": "Right-wing"},
  {"url": "https://www.cbsnews.com/latest/rss/us", "category": "Centrist"},
  {"url": "https://www.navy.mil/DesktopModules/ArticleCS/RSS.ashx?ContentType=1&Site=1067&max=10", "category": "Centrist"},
  {"url": "https://www.usnews.com/rss/news", "category": "Centrist"},
  {"url": "https://mexiconewsdaily.com/feed/", "category": "Centrist"},
  {"url": "https://en.granma.cu/feed", "category": "State-Controlled"},
  {"url": "https://havanatimes.org/feed/", "category": "Centrist"},
  {"url": "http://www.wto.org/library/rss/latest_news_e.xml", "category": "Centrist"},
  {"url": "https://icenews.is/news/politics/feed/", "category": "Centrist"},
  {"url": "https://www.executive-magazine.com/feed", "category": "Centrist"},
  {"url": "https://feeds.feedburner.com/Bernewscom", "category": "Centrist"},
  {"url": "https://www.royalgazette.com/feeds/", "category": "Centrist"},
  {"url": "https://www.consilium.europa.eu/en/rss/pressreleases.ashx", "category": "Centrist"},
  {"url": "https://officialblogofunio.com/feed/", "category": "Centrist"},
  {"url": "https://www.europeanlawblog.eu/rss.xml", "category": "Centrist"},
  {"url": "https://ec.europa.eu/eurostat/en/search?p_p_id=estatsearchportlet_WAR_estatsearchportlet&p_p_lifecycle=2&p_p_state=maximized&p_p_mode=view&p_p_resource_id=atom&_estatsearchportlet_WAR_estatsearchportlet_collection=CAT_PREREL", "category": "Centrist"},
  {"url": "https://ecfr.eu/feed/", "category": "Centrist"},
  {"url": "https://feeds.feedburner.com/ekathimerini/sKip", "category": "Centrist"},
  {"url": "https://www.thenationalherald.com/feed/", "category": "Centrist"},
  {"url": "https://www.crisisgroup.org/rss", "category": "Centrist"},
  {"url": "https://www.mfa.gov.tr/en.rss.mfa?ad9093da-8e71-4678-a1b6-05f297baadc4", "category": "State-Controlled"},
  {"url": "https://www.msf.org/rss/all", "category": "Centrist"},
  {"url": "https://buenosairesherald.com/feed/atom", "category": "Centrist"},
  {"url": "https://www.batimes.com.ar/feed", "category": "Centrist"},
  {"url": "http://news.am/eng/rss/", "category": "Centrist"},
  {"url": "http://en.1in.am/feed", "category": "Centrist"},
  {"url": "http://en.aravot.am/feed/", "category": "Centrist"},
  {"url": "https://stickers.panarmenian.net/feeds/eng/news/", "category": "Centrist"},
  {"url": "https://armenianweekly.com/feed/", "category": "Centrist"},
  {"url": "https://hetq.am/en/rss", "category": "Centrist"},
  {"url": "https://asunciontimes.com/feed/", "category": "Centrist"},
  {"url": "https://en.mercopress.com/rss/politics", "category": "Centrist"},
  {"url": "https://en.mercopress.com/rss/paraguay", "category": "Centrist"},
  {"url": "https://en.mercopress.com/rss/", "category": "Centrist"},
  {"url": "https://allafrica.com/tools/headlines/rdf/latest/headlines.rdf", "category": "Centrist"},
  {"url": "https://www.novinite.com/services/news_rdf.php", "category": "Centrist"},
  {"url": "https://feeds.feedburner.com/TheSofiaGlobe", "category": "Centrist"},
  {"url": "https://informante.web.na/?feed=rss2", "category": "Centrist"},
  {"url": "https://namibiadailynews.info/feed/", "category": "Centrist"},
  {"url": "https://www.namibiansun.com/rssFeed/137", "category": "Centrist"},
  {"url": "https://www.namibiansun.com/rssFeed/145", "category": "Centrist"},
  {"url": "https://www.namibiansun.com/rssFeed/-55", "category": "Centrist"},
  {"url": "https://www.africanews.com/feed/rss", "category": "Centrist"},
  {"url": "https://acturdc.com/feed/", "category": "Centrist"},
  {"url": "https://feeds.northkoreatimes.com/rss/08aysdf7tga9s7f7", "category": "State-Controlled"},
  {"url": "https://www.38north.org/feed/", "category": "Centrist"},
  {"url": "https://www.dailynk.com/english/feed/", "category": "Centrist"},
  {"url": "https://www.rferl.org/api/zbqiml-vomx-tpeqkmy", "category": "Centrist"},
  {"url": "https://www.moldpres.md/config/rss.php?lang=eng", "category": "State-Controlled"},
  {"url": "https://www.tehrantimes.com/rss/tp/698", "category": "State-Controlled"},
  {"url": "https://www.tehrantimes.com/rss", "category": "State-Controlled"},
  {"url": "https://en.irna.ir/rss", "category": "State-Controlled"},
  {"url": "https://en.radiofarda.com/api/zp_qmtl-vomx-tpe_bimr", "category": "Centrist"},
  {"url": "https://en.isna.ir/rss/tp/13", "category": "State-Controlled"},
  {"url": "https://en.isna.ir/rss", "category": "State-Controlled"},
  {"url": "https://www.azernews.az/feed.php", "category": "Centrist"},
  {"url": "https://www.b92.net/rss/b92/english", "category": "Centrist"},
  {"url": "https://www.stat.gov.rs/en-us/RSS", "category": "Centrist"},
  {"url": "https://ottawacitizen.com/feed", "category": "Centrist"},
  {"url": "https://theprovince.com/feed", "category": "Centrist"},
  {"url": "https://moxie.foxnews.com/google-publisher/politics.xml", "category": "Right-wing"},
  {"url": "http://feeds.reuters.com/Reuters/PoliticsNews", "category": "Centrist"},
  {"url": "https://www.realwire.com/rss/feeds.asp?cat=Politics", "category": "Centrist"},
  {"url": "http://www.msnbc.com/feeds/latest", "category": "Left-wing"},
  {"url": "https://crittendenpress.blogspot.com/feeds/posts/default?alt=rss", "category": "Centrist"},
  {"url": "https://www.biziday.ro/feed/", "category": "Centrist"},
  {"url": "https://www.sabanew.net/rss.php?lang=en", "category": "State-Controlled"},
  {"url": "https://english.alahednews.news/rss/541", "category": "State-Controlled"},
  {"url": "https://jordantimes.com/rss-feed/45", "category": "Centrist"},
  {"url": "https://jordantimes.com/rss-feed/47", "category": "Centrist"},
  {"url": "https://thearabianpost.com/feed/", "category": "Centrist"},
  {"url": "https://www.dubaichronicle.com/feed/", "category": "Centrist"},
  {"url": "https://www.aa.com.tr/en/rss/default?cat=live", "category": "State-Controlled"},
  {"url": "https://vlada.gov.hr/RSS?id=14956", "category": "Centrist"},
  {"url": "https://n1info.ba/feed/", "category": "Centrist"},
  {"url": "https://www.palestinechronicle.com/category/articles/feed/", "category": "Centrist"},
  {"url": "https://www.israelnationalnews.com/Rss.aspx", "category": "Right-wing"},
  {"url": "https://www.haaretz.com/srv/haaretz-latest-headlines", "category": "Left-wing"},
  {"url": "https://egyptoil-gas.com/news/feed/", "category": "Centrist"},
  {"url": "https://feeds.feedburner.com/arabistdotnet", "category": "Centrist"},
  {"url": "https://dohanews.co/feed/", "category": "Centrist"},
  {"url": "https://qna.org.qa/en/Pages/RSS-Feeds/Miscellaneous-International", "category": "State-Controlled"},
  {"url": "https://www.bizbahrain.com/feed/", "category": "Centrist"},
  {"url": "https://saudiexpatriate.com/feed/", "category": "Centrist"},
  {"url": "https://www.arabnews.com/cat/3/rss.xml", "category": "Right-wing"},
  {"url": "https://www.arabnews.com/cat/1/rss.xml", "category": "Right-wing"},
  {"url": "https://www.arabtimesonline.com/rssFeed/47/", "category": "Right-wing"},
  {"url": "https://www.omanobserver.om/rssFeed/55", "category": "Centrist"},
  {"url": "https://en.naqd.media/feed/", "category": "Centrist"},
  {"url": "https://www.nna-leb.gov.lb/en/rss", "category": "Centrist"},
  {"url": "https://english.sta.si/rss-1", "category": "Centrist"},
  {"url": "https://www.libyanexpress.com/feed/", "category": "Centrist"},
  {"url": "https://www.libyaherald.com/feed/", "category": "Centrist"},
  {"url": "https://lana.gov.ly/rss/en", "category": "State-Controlled"},
  {"url": "https://feeds.turkmenistannews.net/rss/929bcf2071e81801", "category": "State-Controlled"},
  {"url": "https://en.turkmen.news/feed/", "category": "Centrist"},
  {"url": "https://oc-media.org/feed/", "category": "Centrist"},
  {"url": "https://jam-news.net/feed/", "category": "Centrist"},
  {"url": "https://civil.ge/feed", "category": "Centrist"},
  {"url": "https://www.altaghyeer.info/en/feed/", "category": "Centrist"},
  {"url": "https://www.dabangasudan.org/en/feed", "category": "Centrist"},
  {"url": "https://praguemorning.cz/feed/", "category": "Centrist"},
  {"url": "https://www.czechjournal.cz/feed/", "category": "Centrist"},
  {"url": "https://tol.org/feed", "category": "Centrist"},
  {"url": "https://www.florencedailynews.com/feed/", "category": "Centrist"},
  {"url": "https://www.ansa.it/english/news/english_nr_rss.xml", "category": "Centrist"},
  {"url": "https://www.vaticannews.va/en.rss.xml", "category": "State-Controlled"},
  {"url": "https://news.mc/feed/", "category": "Centrist"},
  {"url": "https://www.snb.ch/public/rss/en/speeches", "category": "Centrist"},
  {"url": "https://feeds.thelocal.com/rss/ch", "category": "Centrist"},
  {"url": "https://lenews.ch/feed/", "category": "Centrist"},
  {"url": "https://www.ungeneva.org/en/news-media/press-releases-list/rss.xml", "category": "Centrist"},
  {"url": "https://sana.sy/en/feed/", "category": "State-Controlled"},
  {"url": "https://www.bahamaspress.com/feed/", "category": "Centrist"},
  {"url": "https://feeds.afghanistannews.net/rss/6e1d5c8e1f98f17c", "category": "Centrist"},
  {"url": "http://feeds.afghanistansun.com/rss/6e1d5c8e1f98f17c", "category": "Centrist"},
  {"url": "https://www.ariananews.af/feed/", "category": "State-Controlled"},
  {"url": "https://www.afghanislamicpress.com/en/feed", "category": "State-Controlled"},
  {"url": "https://thinkmagazine.mt/feed/", "category": "Centrist"},
  {"url": "http://www.maltatoday.com.mt/rss/", "category": "Centrist"},
  {"url": "http://feed.gozonews.com/GozoNews", "category": "Centrist"},
];

const WORLD_NEWS_URLS = FEEDS_DATA.map((feed) => feed.url);

function getFeedCategory(url: string): 'Centrist' | 'Left-wing' | 'Right-wing' | 'State-Controlled' {
  const feedData = FEEDS_DATA.find((feed) => feed.url === url);
  return feedData?.category || 'Centrist';
}

const SOURCE_COUNTRY: Record<string, string> = {
  'https://www.aljazeera.com/xml/rss/all.xml': 'Qatar',
  'https://www.bbc.com/news/rss.xml': 'United Kingdom',
  'https://feeds.bbci.co.uk/news/rss.xml': 'United Kingdom',
  'https://www.cbc.ca/webfeed/rss/rss-politics': 'Canada',
  'https://www.cbc.ca/webfeed/rss/rss-world': 'Canada',
  'https://www.cbc.ca/webfeed/rss/rss-canada': 'Canada',
  'https://www.cnn.com/rss': 'United States',
  'https://www.nytimes.com/services/xml/rss/nyt/World.xml': 'United States',
  'https://rss.nytimes.com/services/xml/rss/nyt/World.xml': 'United States',
  'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml': 'United States',
  'https://www.washingtonpost.com/rss/world': 'United States',
  'https://feeds.washingtonpost.com/rss/world': 'United States',
  'https://www.washingtonpost.com/arcio/rss/category/politics/': 'United States',
  'https://www.washingtontimes.com/rss/headlines/news/politics/': 'United States',
  'https://www.cbsnews.com/latest/rss/us': 'United States',
  'https://www.cbsnews.com/latest/rss/world': 'United States',
  'https://www.cbsnews.com/latest/rss/politics': 'United States',
  'https://www.nbcnews.com/rss': 'United States',
  'https://www.usnews.com/rss/news': 'United States',
  'https://www.mprnews.org/feed/politics': 'United States',
  'https://feeds.content.dowjones.io/public/rss/RSSWorldNews': 'United States',
  'https://feeds.content.dowjones.io/public/rss/socialpoliticsfeed': 'United States',
  'https://www.af.mil/DesktopModules/ArticleCS/RSS.ashx?ContentType=1&Site=1&isdashboardselected=0&max=20': 'United States',
  'https://www.navy.mil/DesktopModules/ArticleCS/RSS.ashx?ContentType=1&Site=1067&max=10': 'United States',
  'https://www.war.gov/DesktopModules/ArticleCS/RSS.ashx?max=10&ContentType=1&Site=945': 'United States',
  'https://travel.state.gov/_res/rss/TAsTWs.xml': 'United States',
  'https://www.pbs.org/newshour/feeds/rss/politics': 'United States',
  'https://www.pbs.org/newshour/feeds/rss/headlines': 'United States',
  'https://www.voanews.com/api/zqboml-vomx-tpeivmy': 'United States',
  'https://www.rferl.org/api/zbqiml-vomx-tpeqkmy': 'United States',
  'https://en.radiofarda.com/api/zp_qmtl-vomx-tpe_bimr': 'United States',
  'https://crittendenpress.blogspot.com/feeds/posts/default?alt=rss': 'United States',
  'https://ottawacitizen.com/feed': 'Canada',
  'https://theprovince.com/feed': 'Canada',
  'https://www.pm.gc.ca/en/news.rss': 'Canada',
  'https://www.ipolitics.ca/feed/': 'Canada',
  'https://globalnews.ca/world/feed/': 'Canada',
  'https://globalnews.ca/politics/feed/': 'Canada',
  'https://globalnews.ca/canada/feed/': 'Canada',
  'https://www.thestar.com/search/?f=rss&t=article&c=politics&l=50&s=start_time&sd=desc': 'Canada',
  'https://www.politicshome.com/rss': 'United Kingdom',
  'https://www.independent.co.uk/news/world/rss': 'United Kingdom',
  'https://www.independent.co.uk/news/uk/rss': 'United Kingdom',
  'https://feeds.skynews.com/feeds/rss/world.xml': 'United Kingdom',
  'https://feeds.skynews.com/feeds/rss/politics.xml': 'United Kingdom',
  'https://www.b92.net/rss/b92/english': 'Serbia',
  'https://www.stat.gov.rs/en-us/RSS': 'Serbia',
  'https://vlada.gov.hr/RSS?id=14956': 'Croatia',
  'https://n1info.ba/feed/': 'Bosnia and Herzegovina',
  'https://www.rt.com/rss/': 'Russia',
  'https://www.themoscowtimes.com/rss/news': 'Russia',
  'https://sputnikglobe.com/export/rss2/archive/index.xml': 'Russia',
  'https://eng.globalaffairs.ru/feed/': 'Russia',
  'https://tass.com/rss/v2.xml': 'Russia',
  'https://government.ru/en/all/rss/': 'Russia',
  'https://rthk.hk/rthk/news/rss/e_expressnews_einternational.xml': 'Hong Kong',
  'https://www.aa.com.tr/en/rss/default?cat=live': 'Turkey',
  'https://www.mfa.gov.tr/en.rss.mfa?ad9093da-8e71-4678-a1b6-05f297baadc4': 'Turkey',
  'https://en.yenisafak.com/rss-feeds?category=/politics': 'Turkey',
  'https://www.arabnews.com/cat/3/rss.xml': 'Saudi Arabia',
  'https://www.arabnews.com/cat/1/rss.xml': 'Saudi Arabia',
  'https://www.arabtimesonline.com/rssFeed/47/': 'Kuwait',
  'https://qna.org.qa/en/Pages/RSS-Feeds/Miscellaneous-International': 'Qatar',
  'https://saudiexpatriate.com/feed/': 'Saudi Arabia',
  'https://www.bizbahrain.com/feed/': 'Bahrain',
  'https://www.omanobserver.om/rssFeed/55': 'Oman',
  'https://dohanews.co/feed/': 'Qatar',
  'https://en.irna.ir/rss': 'Iran',
  'https://en.isna.ir/rss': 'Iran',
  'https://en.isna.ir/rss/tp/13': 'Iran',
  'https://www.tehrantimes.com/rss': 'Iran',
  'https://www.tehrantimes.com/rss/tp/698': 'Iran',
  'https://en.naqd.media/feed/': 'Iran',
  'https://www.nna-leb.gov.lb/en/rss': 'Lebanon',
  'https://www.lbcgroup.tv/Rss/News/en/8/lebanon-news': 'Lebanon',
  'https://www.lbcgroup.tv/Rss/News/en/125/world-news': 'Lebanon',
  'https://english.alahednews.news/rss/541': 'Lebanon',
  'https://jordantimes.com/rss-feed/45': 'Jordan',
  'https://jordantimes.com/rss-feed/47': 'Jordan',
  'https://www.shafaq.com/rss/en/Iraq': 'Iraq',
  'https://www.iraq-businessnews.com/feed/': 'Iraq',
  'https://syrianews.cc/feed/': 'Syria',
  'https://en.granma.cu/feed': 'Cuba',
  'https://havanatimes.org/feed/': 'Cuba',
  'https://www.palestinechronicle.com/category/articles/feed/': 'Palestine',
  'https://egyptoil-gas.com/news/feed/': 'Egypt',
  'https://egyptianstreets.com/feed/': 'Egypt',
  'https://www.dailynewsegypt.com/feed/': 'Egypt',
  'https://feeds.feedburner.com/arabistdotnet': 'Morocco',
  'https://www.israelnationalnews.com/Rss.aspx': 'Israel',
  'https://www.haaretz.com/srv/haaretz-latest-headlines': 'Israel',
  'https://www.crisisgroup.org/rss': 'Belgium',
  'https://www.europarl.europa.eu/rss/doc/press-releases/en.xml': 'Belgium',
  'https://www.consilium.europa.eu/en/rss/pressreleases.ashx': 'Belgium',
  'https://ec.europa.eu/eurostat/en/search?p_p_id=estatsearchportlet_WAR_estatsearchportlet&p_p_lifecycle=2&p_p_state=maximized&p_p_mode=view&p_p_resource_id=atom&_estatsearchportlet_WAR_estatsearchportlet_collection=CAT_PREREL': 'Belgium',
  'https://ecfr.eu/feed/': 'Germany',
  'https://www.europeanlawblog.eu/rss.xml': 'Netherlands',
  'https://officialblogofunio.com/feed/': 'Belgium',
  'https://www.foreignaffairs.com/rss.xml': 'United States',
  'https://rss.politico.com/politics-news.xml': 'United States',
  'https://moxie.foxnews.com/google-publisher/world.xml': 'United States',
  'https://moxie.foxnews.com/google-publisher/us.xml': 'United States',
  'https://moxie.foxnews.com/google-publisher/politics.xml': 'United States',
  'https://www.nationalreview.com/feed': 'United States',
  'https://feeds.theatlantic.com/theatlantic/international': 'United States',
  'https://feeds.theatlantic.com/theatlantic/politics': 'United States',
  'https://www.newyorker.com/feed/news': 'United States',
  'https://www.vox.com/rss/index.xml': 'United States',
  'https://www.slate.com/feed': 'United States',
  'https://www.huffpost.com/news/feed': 'United States',
  'https://www.dailykos.com/feeds/rss': 'United States',
  'https://www.breitbart.com/feed': 'United States',
  'https://www.dailycaller.com/feed': 'United States',
  'https://www.theblaze.com/feed': 'United States',
  'https://www.buzzfeed.com/politics.xml': 'United States',
  'https://www.nationalpost.com/category/news/politics/feed.xml': 'Canada',
  'https://www.policyalternatives.ca/feed/': 'Canada',
  'https://thewalrus.ca/category/current-affairs/politics/feed/': 'Canada',
  'https://theconversation.com/ca/politics/articles.atom': 'Canada',
  'https://www.nationalobserver.com/taxonomy/term/4/rss': 'Canada',
  'https://www.nationalobserver.com/rss': 'Canada',
  'https://in-sights.ca/feed/': 'Canada',
  'https://canadiandimension.com/feeds/articles': 'Canada',
  'https://broadbentinstitute.ca/updates/feed/': 'Canada',
  'https://albertapolitics.ca/feed/': 'Canada',
  'https://www.ekospolitics.com/index.php/feed/': 'Canada',
  'https://www.canadianprogressiveworld.com/feed/': 'Canada',
  'https://www.realwire.com/rss/feeds.asp?cat=Politics': 'United Kingdom',
  'https://mexiconewsdaily.com/feed/': 'Mexico',
  'https://asunciontimes.com/feed/': 'Paraguay',
  'https://en.mercopress.com/rss/politics': 'Argentina',
  'https://en.mercopress.com/rss/paraguay': 'Argentina',
  'https://en.mercopress.com/rss/': 'Argentina',
  'https://www.batimes.com.ar/feed': 'Argentina',
  'https://buenosairesherald.com/feed/atom': 'Argentina',
  'https://allafrica.com/tools/headlines/rdf/latest/headlines.rdf': 'South Africa',
  'https://www.africanews.com/feed/rss': 'Africa',
  'https://acturdc.com/feed/': 'Africa',
  'https://namibiadailynews.info/feed/': 'Namibia',
  'https://informante.web.na/?feed=rss2': 'Namibia',
  'https://www.namibiansun.com/rssFeed/137': 'Namibia',
  'https://www.namibiansun.com/rssFeed/145': 'Namibia',
  'https://www.namibiansun.com/rssFeed/-55': 'Namibia',
  'https://www.novinite.com/services/news_rdf.php': 'Bulgaria',
  'https://feeds.feedburner.com/TheSofiaGlobe': 'Bulgaria',
  'http://www.wto.org/library/rss/latest_news_e.xml': 'Switzerland',
  'https://www.scmp.com/rss/5/feed': 'Hong Kong',
  'https://www.scmp.com/rss/318198/feed': 'Hong Kong',
  'https://www.scmp.com/rss/318206/feed': 'Hong Kong',
  'https://www.japantimes.co.jp/feed/': 'Japan',
  'https://abc.net.au/news/rss': 'Australia',
  'http://feeds.skynews.com/feeds/rss/world.xml': 'Australia',
  'https://www.9news.com.au/rss': 'Australia',
  'https://www.abc.net.au/news/rss/': 'Australia',
  'https://www.sbs.com.au/news/rss': 'Australia',
  'https://www.theaustralian.com.au/news/rss': 'Australia',
  'https://www.heraldsun.com.au/rss': 'Australia',
  'https://www.smh.com.au/rss/feed.xml': 'Australia',
  'https://www.theage.com.au/rss': 'Australia',
  'https://www.brisbanetimes.com.au/rss': 'Australia',
  'https://www.watoday.com.au/rss': 'Australia',
  'https://www.perthnow.com.au/rss': 'Australia',
  'https://www.adelaidenow.com.au/rss': 'Australia',
  'https://www.dailytelegraph.com.au/rss': 'Australia',
  'https://www.canberratimes.com.au/rss.xml': 'Australia',
  'https://www.ft.com/rss/home': 'United Kingdom',
  'https://www.lemonde.fr/en/international/rss_full.xml': 'France',
  'https://www.france24.com/en/rss': 'France',
  'https://www.euronews.com/rss?level=theme&name=news': 'France',
  'https://www.spiegel.de/international/index.rss': 'Germany',
  'https://www.tagesschau.de/xml/rss2': 'Germany',
  'https://www.deutschlandfunk.de/nachrichten.rss': 'Germany',
  'https://www.dw.com/atom/rss-en-all': 'Germany',
  'https://rss.dw.com/atom/rss-en-all': 'Germany',
  'https://www.welt.de/schlagzeilen/index.rss': 'Germany',
  'https://timesofindia.indiatimes.com/rssfeed.cms?feedtype=sitesection&feedname=world': 'India',
  'https://www.thehindu.com/news/national/rss/': 'India',
  'https://indianexpress.com/section/politics/feed/': 'India',
  'https://indianexpress.com/section/news-today/feed/': 'India',
  'https://www.hindustantimes.com/feeds/rss/world-news/rssfeed.xml': 'India',
  'https://www.indiatoday.in/rss/1206577': 'India',
  'https://feeds.feedburner.com/ndtvnews-world-news': 'India',
  'https://english.alarabiya.net/feed/rss2/en/News.xml': 'United Arab Emirates',
  'https://english.alarabiya.net/rss/': 'United Arab Emirates',
  'https://www.dubaichronicle.com/feed/': 'United Arab Emirates',
  'https://thearabianpost.com/feed/': 'United Arab Emirates',
  'https://www.cyprustodayonline.com/rss/category/south-cyprus': 'Cyprus',
  'https://www.cyprustodayonline.com/rss/category/news': 'Cyprus',
  'https://www.cyprustodayonline.com/rss/category/cyprus': 'Cyprus',
  'https://feeds.abcnews.com/abcnews/politicsheadlines': 'United States',
  'https://feeds.abcnews.com/abcnews/usheadlines': 'United States',
  'https://feeds.abcnews.com/abcnews/internationalheadlines': 'United States',
  'https://praguemorning.cz/feed/': 'Czech Republic',
  'https://www.czechjournal.cz/feed/': 'Czech Republic',
  'https://tol.org/feed': 'Czech Republic',
  'https://www.florencedailynews.com/feed/': 'Italy',
  'https://www.ansa.it/english/news/english_nr_rss.xml': 'Italy',
  'https://www.vaticannews.va/en.rss.xml': 'Vatican City',
  'https://news.mc/feed/': 'Monaco',
  'https://www.snb.ch/public/rss/en/speeches': 'Switzerland',
  'https://feeds.thelocal.com/rss/ch': 'Switzerland',
  'https://lenews.ch/feed/': 'Switzerland',
  'https://www.ungeneva.org/en/news-media/press-releases-list/rss.xml': 'Switzerland',
  'https://sana.sy/en/feed/': 'Syria',
  'https://feeds.afghanistannews.net/rss/6e1d5c8e1f98f17c': 'Afghanistan',
  'http://feeds.afghanistansun.com/rss/6e1d5c8e1f98f17c': 'Afghanistan',
  'https://www.ariananews.af/feed/': 'Afghanistan',
  'https://www.afghanislamicpress.com/en/feed': 'Afghanistan',
  'https://thinkmagazine.mt/feed/': 'Malta',
  'http://www.maltatoday.com.mt/rss/': 'Malta',
  'http://feed.gozonews.com/GozoNews': 'Malta',
  'https://www.bahamaspress.com/feed/': 'Bahamas',
};

function getSourceCountry(url: string): string {
  return SOURCE_COUNTRY[url] || 'Unknown';
}

const TOPIC_COUNTRIES: Record<string, string[]> = {
  lebanon: ['Lebanon'],
  israel: ['Israel'],
  palestine: ['Palestine'],
  jordan: ['Jordan'],
  iraq: ['Iraq'],
  syria: ['Syria'],
  egypt: ['Egypt'],
  iran: ['Iran'],
  turkey: ['Turkey'],
  'saudi arabia': ['Saudi Arabia'],
  uae: ['United Arab Emirates'],
  qatar: ['Qatar'],
  bahrain: ['Bahrain'],
  oman: ['Oman'],
  kuwait: ['Kuwait'],
  yemen: ['Yemen'],
  morocco: ['Morocco'],
  algeria: ['Algeria'],
  tunisia: ['Tunisia'],
  libya: ['Libya'],
  sudan: ['Sudan'],
  ethiopia: ['Ethiopia'],
  somalia: ['Somalia'],
  ukraine: ['Ukraine'],
  russia: ['Russia'],
  china: ['China'],
  taiwan: ['Taiwan'],
  japan: ['Japan'],
  korea: ['South Korea', 'North Korea'],
  india: ['India'],
  pakistan: ['Pakistan'],
  bangladesh: ['Bangladesh'],
  'sri lanka': ['Sri Lanka'],
  myanmar: ['Myanmar'],
  thailand: ['Thailand'],
  vietnam: ['Vietnam'],
  philippines: ['Philippines'],
  indonesia: ['Indonesia'],
  malaysia: ['Malaysia'],
  singapore: ['Singapore'],
  australia: ['Australia'],
  'new zealand': ['New Zealand'],
  canada: ['Canada'],
  'united states': ['United States'],
  usa: ['United States'],
  britain: ['United Kingdom'],
  'united kingdom': ['United Kingdom'],
  france: ['France'],
  germany: ['Germany'],
  italy: ['Italy'],
  spain: ['Spain'],
  portugal: ['Portugal'],
  netherlands: ['Netherlands'],
  belgium: ['Belgium'],
  switzerland: ['Switzerland'],
  austria: ['Austria'],
  poland: ['Poland'],
  brazil: ['Brazil'],
  argentina: ['Argentina'],
  mexico: ['Mexico'],
  colombia: ['Colombia'],
  chile: ['Chile'],
  peru: ['Peru'],
  venezuela: ['Venezuela'],
  cuba: ['Cuba'],
  'south africa': ['South Africa'],
  nigeria: ['Nigeria'],
  kenya: ['Kenya'],
};

function extractTopicCountries(text: string): string[] {
  const lowerText = text.toLowerCase();
  const found: string[] = [];
  for (const [topic, countries] of Object.entries(TOPIC_COUNTRIES)) {
    if (lowerText.includes(topic)) {
      found.push(...countries);
    }
  }
  return Array.from(new Set(found));
}

function getArticleCountry(article: NewsItem): string {
  const topicCountries = extractTopicCountries(`${article.title} ${article.summary}`);
  if (topicCountries.length > 0) {
    return topicCountries[0];
  }
  return getSourceCountry(article.url);
}

const AVIATION_RSS_URLS = [
  'https://www.aeroroutes.com/?format=rss',
  'https://www.aero-news.net/news/rssCOMANW.xml',
  'https://samchui.com/feed/',
  'https://simpleflying.com/feed/',
  'https://theaviationist.com/feed/',
  'https://avgeekery.com/feed/',
  'https://australianaviation.com.au/feed/',
  'https://feeds.feedburner.com/Ex-yuAviationNews',
  'https://generalaviationnews.com/feed/',
  'https://www.airbus.com/en/rss-all-feeds/15571?tid=15571&fid=29711',
  'https://runwaygirlnetwork.com/feed/',
  'https://www.aviationpros.com/rss',
  'https://www.aviationtoday.com/feed/',
  'https://www.flightglobal.com/feed/',
  'https://www.thehimalayantimes.com/rssFeed/11/44',
];

interface FeedResult {
  success: boolean;
  items: NewsItem[];
  source: NewsSource;
}

const feedCache = new Map<string, { data: NewsItem[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const MAX_CONCURRENCY = 12;

async function runWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  limit: number
): Promise<PromiseSettledResult<T>[]> {
  const results: PromiseSettledResult<T>[] = new Array(tasks.length);
  let cursor = 0;

  const worker = async () => {
    while (cursor < tasks.length) {
      const index = cursor++;
      try {
        results[index] = { status: 'fulfilled', value: await tasks[index]() };
      } catch (reason) {
        results[index] = { status: 'rejected', reason };
      }
    }
  };

  const workers = Array.from({ length: Math.min(limit, tasks.length) }, worker);
  await Promise.all(workers);
  return results;
}

function safeQuerySelector(element: Element, selector: string): Element | null {
  try {
    return element.querySelector(selector);
  } catch {
    return null;
  }
}

function safeQuerySelectorAll(element: Element | Document, selector: string): NodeListOf<Element> {
  try {
    return element.querySelectorAll(selector);
  } catch {
    return element.querySelectorAll('*');
  }
}

function getElementsByLocalName(element: Element | Document, localName: string): Element[] {
  const results: Element[] = [];
  try {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT);
    let node: Node | null = walker.currentNode;
    while ((node = walker.nextNode())) {
      if ((node as Element).localName === localName) {
        results.push(node as Element);
      }
    }
  } catch {
    const all = safeQuerySelectorAll(element, '*');
    for (let i = 0; i < all.length; i++) {
      if (all[i].localName === localName) {
        results.push(all[i]);
      }
    }
  }
  return results;
}

class RSSParser {
  static parseFeed(text: string, url: string): { items: NewsItem[]; source: NewsSource } | null {
    try {
      const format = FeedFormatDetector.detect(text);

      switch (format) {
        case 'json':
          return JsonFeedParser.parse(text, url);
        case 'html':
          return HTMLParser.parse(text, url);
        case 'rss':
        case 'atom':
        case 'rdf':
          return XMLParser.parse(text, url);
        default:
          return null;
      }
    } catch {
      return null;
    }
  }

  static cleanXMLContent(text: string): string {
    let cleaned = text
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .replace(/&bull;/g, '&#8226;')
      .replace(/&mdash;/g, '&#8212;')
      .replace(/&ndash;/g, '&#8211;')
      .replace(/&hellip;/g, '&#8230;')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .trim();

    if (cleaned.includes('<html') || cleaned.includes('<!DOCTYPE html')) {
      cleaned = cleaned
        .replace(/<\/?html[^>]*>/gi, '')
        .replace(/<\/?head[^>]*>/gi, '')
        .replace(/<\/?body[^>]*>/gi, '')
        .replace(/<\/?meta[^>]*>/gi, '')
        .replace(/<\/?link[^>]*>/gi, '')
        .replace(/<\/?script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<\/?style[^>]*>[\s\S]*?<\/style>/gi, '')
        .trim();
    }

    return cleaned;
  }

  static extractText(el: Element | null): string {
    if (!el) return '';
    let text = (el.textContent || '').trim();
    text = text.replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '').trim();
    return RSSParser.cleanText(text);
  }

  static cleanText(text: string): string {
    return text
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

class JsonFeedParser {
  static parse(text: string, url: string): { items: NewsItem[]; source: NewsSource } | null {
    if (!text || typeof text !== 'string') return null;
    const trimmed = text.trim();
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return null;
    try {
      const parsed = JSON.parse(trimmed);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
      if (!parsed.version || !parsed.version.startsWith('https://jsonfeed.org/')) return null;
      if (!Array.isArray(parsed.items)) return null;
      const sourceName = RSS_CREDITS[url] || new URL(url).hostname.replace('www.', '').split('.')[0];
      const category = getFeedCategory(url);
      const items: NewsItem[] = parsed.items.slice(0, 20).map((it: any, idx: number) => ({
        id: `${sourceName}-json-${idx}-${Date.now()}`,
        title: RSSParser.cleanText(it.title || ''),
        summary: RSSParser.cleanText(it.content_text || it.content_html || it.summary || '').substring(0, 300),
        date: it.date_published ? new Date(it.date_published).toLocaleDateString() : 'Recent',
        url: it.url || it.external_url || url,
        source: sourceName,
        category,
        imageUrl: it.image_url || (it.attachments?.[0]?.mime_type?.startsWith('image/') ? it.attachments?.[0]?.url : undefined),
        country: getSourceCountry(url),
        topicCountries: extractTopicCountries(`${it.title || ''} ${it.content_text || it.content_html || it.summary || ''}`),
      }));
      const sourceCountry = getSourceCountry(url);
      return { items, source: { name: sourceName, status: items.length > 0 ? 'success' : 'failed', url, category, articleCount: items.length, checkedAt: new Date().toISOString(), country: sourceCountry } };
    } catch {
      return null;
    }
  }
}

export type FeedFormat = 'json' | 'rss' | 'atom' | 'rdf' | 'html' | 'unknown';

class FeedFormatDetector {
  static detect(text: string): FeedFormat {
    const trimmed = text.trim();
    if (!trimmed) return 'unknown';

    const firstNonWhitespace = trimmed.match(/^\s*([<{\[a-zA-Z])/);
    if (!firstNonWhitespace) return 'unknown';

    const marker = firstNonWhitespace[1];

    if (marker === '{') {
      return this.detectJson(trimmed);
    }

    if (marker === '<') {
      return this.detectXmlOrHtml(trimmed);
    }

    return 'unknown';
  }

  private static detectJson(text: string): FeedFormat {
    try {
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return 'unknown';
      const version = parsed.version;
      if (typeof version === 'string' && version.startsWith('https://jsonfeed.org/')) {
        return 'json';
      }
      if (Array.isArray(parsed.items)) {
        return 'json';
      }
      return 'unknown';
    } catch {
      return 'unknown';
    }
  }

  private static detectXmlOrHtml(text: string): FeedFormat {
    const head = text.substring(0, Math.min(text.length, 2048));
    const lower = head.toLowerCase();

    if (lower.includes('<!doctype html') || lower.includes('<html')) return 'html';

    const tagMatch = lower.match(/<\?xml[^?]*\?>[\s]*<(\w+)/);
    const rootTag = tagMatch ? tagMatch[1] : lower.match(/<(\w+)[\s>]/)?.[1] || '';

    if (!rootTag) {
      const dom = new DOMParser().parseFromString(text, 'text/xml');
      if (dom.querySelector('parsererror')) return 'unknown';
      const root = dom.documentElement;
      if (!root) return 'unknown';
      const rootNs = root.getAttribute('xmlns') || '';
      const tag = root.tagName.toLowerCase();
      if (tag === 'feed' || rootNs.includes('atom')) return 'atom';
      if (tag === 'rss' || rootNs.includes('rss')) return 'rss';
      if (tag === 'rdf:rdf' || rootNs.includes('rdf') || tag === 'rdf') return 'rdf';
      return 'unknown';
    }

    const localName = rootTag.includes(':') ? rootTag.split(':')[1] : rootTag;

    if (localName === 'rss') return 'rss';
    if (localName === 'feed') return 'atom';
    if (localName === 'rdf' || localName === 'rdf:rdf') return 'rdf';

    const nsDecl = lower.match(/xmlns[:=]\s*["']([^"']*)["']/);
    if (nsDecl) {
      const ns = nsDecl[1].toLowerCase();
      if (ns.includes('atom')) return 'atom';
      if (ns.includes('rss') || ns.includes('rdf')) return 'rdf';
    }

    const dom = new DOMParser().parseFromString(text, 'text/xml');
    if (dom.querySelector('parsererror')) return 'unknown';
    const root = dom.documentElement;
    if (!root) return 'unknown';
    const rootNs = root.getAttribute('xmlns') || '';
    const tag = root.tagName.toLowerCase();
    if (tag === 'feed' || rootNs.includes('atom')) return 'atom';
    if (tag === 'rss' || rootNs.includes('rss')) return 'rss';
    if (tag === 'rdf:rdf' || rootNs.includes('rdf') || tag === 'rdf') return 'rdf';

    return 'unknown';
  }
}

class XMLParser {
  private static detectFeedFormat(xml: Document): 'rss' | 'atom' | 'rdf' | 'unknown' {
    const root = xml.documentElement;
    if (!root) return 'unknown';

    const tagName = root.tagName.toLowerCase();

    if (tagName === 'rss') return 'rss';
    if (tagName === 'feed') return 'atom';
    if (tagName === 'rdf:rdf' || root.getAttribute('xmlns:rdf') || tagName === 'rdf') return 'rdf';

    const ns = root.getAttribute('xmlns') || '';
    if (ns.includes('atom')) return 'atom';
    if (ns.includes('rss')) return 'rss';
    if (ns.includes('rdf')) return 'rdf';

    return 'unknown';
  }

  private static sampleFirstItem(root: Element, format: string): Record<string, unknown> {
    const candidates = format === 'atom' 
      ? getElementsByLocalName(root, 'entry') 
      : getElementsByLocalName(root, 'item');
    if (candidates.length === 0) return { found: 0 };
    const el = candidates[0];
    const title = getElementsByLocalName(el, 'title').length > 0 ? '<title present>' : '<title missing>';
    const link = getElementsByLocalName(el, 'link').length > 0 ? '<link present>' : '<link missing>';
    const desc = getElementsByLocalName(el, 'description').length > 0 ? '<description present>' : '<description missing>';
    return { found: candidates.length, firstItem: `${title} ${link} ${desc}` };
  }

  static parse(text: string, url: string): { items: NewsItem[]; source: NewsSource } | null {
    try {
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, 'text/xml');

      if (!xml.documentElement || xml.querySelector('parsererror')) {
        return null;
      }

      const sourceName = RSS_CREDITS[url] || new URL(url).hostname.replace('www.', '').split('.')[0];
      const category = getFeedCategory(url);
      const items: NewsItem[] = [];

      const format = this.detectFeedFormat(xml);
      const root = xml.documentElement;

      if (format === 'rss' || format === 'rdf') {
        const channel = root.querySelector('channel') || root;
        const itemElements = channel.querySelectorAll('item');
        if (itemElements.length === 0 && format === 'rdf') {
          const itemsRdf = getElementsByLocalName(root, 'item');
          itemsRdf.forEach((element, i) => {
            const item = this.extractItem(element, sourceName, category, i, url);
            if (item) items.push(item);
          });
        } else {
          itemElements.forEach((element, i) => {
            const item = this.extractItem(element, sourceName, category, i, url);
            if (item) items.push(item);
          });
        }
      } else if (format === 'atom') {
        const entryElements = root.querySelectorAll('entry');
        if (entryElements.length === 0) {
          const atomEntries = getElementsByLocalName(root, 'entry');
          atomEntries.forEach((element, i) => {
            const item = this.extractItem(element, sourceName, category, i, url);
            if (item) items.push(item);
          });
        } else {
          entryElements.forEach((element, i) => {
            const item = this.extractItem(element, sourceName, category, i, url);
            if (item) items.push(item);
          });
        }
      } else {
        const selectors = ['item', 'entry'];
        let elements: NodeListOf<Element> | null = null;
        for (const selector of selectors) {
          elements = xml.querySelectorAll(selector);
          if (elements.length > 0) break;
        }
        if (!elements || elements.length === 0) {
          const localItems = getElementsByLocalName(root, 'item');
          if (localItems.length > 0) {
            localItems.forEach((element, i) => {
              const item = this.extractItem(element, sourceName, category, i, url);
              if (item) items.push(item);
            });
          } else {
            const localEntries = getElementsByLocalName(root, 'entry');
            localEntries.forEach((element, i) => {
              const item = this.extractItem(element, sourceName, category, i, url);
              if (item) items.push(item);
            });
          }
        } else {
          elements.forEach((element, i) => {
            const item = this.extractItem(element, sourceName, category, i, url);
            if (item) items.push(item);
          });
        }
      }

      if (items.length === 0) {
        return {
          items: [],
          source: {
            name: sourceName,
            status: 'success',
            url,
            category,
            reason: `No <item>/<entry> elements found (${format} format detected)`,
            articleCount: 0,
            checkedAt: new Date().toISOString()
          }
        };
      }

      return {
        items,
        source: {
          name: sourceName,
          status: 'success',
          url,
          category,
          reason: undefined,
          articleCount: items.length,
          checkedAt: new Date().toISOString()
        }
      };
    } catch {
      return null;
    }
  }

  private static extractItem(element: Element, sourceName: string, category: 'Centrist' | 'Left-wing' | 'Right-wing' | 'State-Controlled', index: number, baseUrl?: string): NewsItem | null {
    let title = '';
    const titleEl = this.pickElement(element, ['title', 'atom:title', 'dc:title']);
    if (titleEl) title = RSSParser.extractText(titleEl);

    let link = '';
    const linkEl = this.pickElement(element, ['link', 'atom:link', 'dc:link', 'guid']);
    if (linkEl) {
      link = RSSParser.extractText(linkEl) || linkEl.getAttribute('href') || linkEl.getAttribute('url') || '';
    }

    let summary = '';
    const contentEl = this.pickElement(element, [
      'description',
      'content',
      'atom:content',
      'atom:summary',
      'summary',
      'content:encoded',
      'dc:description'
    ]);
    if (contentEl) {
      summary = RSSParser.extractText(contentEl).substring(0, 300);
    }

    let date = 'Recent';
    let itemDate: Date | null = null;
    const dateEl = this.pickElement(element, [
      'pubDate',
      'published',
      'atom:published',
      'updated',
      'atom:updated',
      'dc:date'
    ]);
    if (dateEl) {
      const raw = RSSParser.extractText(dateEl);
      if (raw) {
        try {
          const parsedDate = new Date(raw);
          if (!isNaN(parsedDate.getTime())) {
            date = parsedDate.toLocaleDateString();
            itemDate = parsedDate;
          }
        } catch {
          // Continue
        }
      }
    }

    if (!title) return null;

    if (!link && baseUrl) {
      link = baseUrl;
    }

    const topicCountries = extractTopicCountries(`${title} ${summary}`);
    return {
      id: `${sourceName}-${index}-${Date.now()}`,
      title: title.substring(0, 300),
      summary,
      date,
      url: link,
      source: sourceName,
      category,
      imageUrl: this.extractImage(element),
      _ts: itemDate ? itemDate.getTime() : Date.now(),
      topicCountries
    };
  }

  private static pickElement(element: Element, selectors: string[]): Element | null {
    for (const selector of selectors) {
      let el = safeQuerySelector(element, selector);
      if (el) return el;

      if (selector.includes(':')) {
        const escaped = selector.replace(':', '\\:');
        el = safeQuerySelector(element, escaped);
        if (el) return el;
      }

      const localName = selector.includes(':') ? selector.split(':')[1] : selector;
      const local = getElementsByLocalName(element, localName);
      if (local.length > 0) return local[0];
    }
    return null;
  }

  private static extractImage(element: Element): string | undefined {
    const mediaContent = this.pickElement(element, ['media:content', 'media\\:content']);
    if (mediaContent?.getAttribute('type')?.startsWith('image/')) {
      return mediaContent.getAttribute('url') || undefined;
    }

    const enclosure = this.pickElement(element, ['enclosure']);
    if (enclosure?.getAttribute('type')?.startsWith('image/')) {
      return enclosure.getAttribute('url') || undefined;
    }

    const thumbnail = this.pickElement(element, ['media:thumbnail', 'media\\:thumbnail']);
    if (thumbnail?.hasAttribute('url')) {
      return thumbnail.getAttribute('url') || undefined;
    }

    const content = this.pickElement(element, ['description', 'content', 'atom:content', 'content:encoded']);
    if (content) {
      const raw = RSSParser.extractText(content);
      if (raw) {
        const imgMatch = raw.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (imgMatch) return imgMatch[1];
      }
    }

    return undefined;
  }
}

class HTMLParser {
  static parse(text: string, url: string): { items: NewsItem[]; source: NewsSource } | null {
    try {
      const parser = new DOMParser();
      const html = parser.parseFromString(text, 'text/html');

      if (!html.documentElement) {
        return null;
      }

      const sourceName = RSS_CREDITS[url] || new URL(url).hostname.replace('www.', '').split('.')[0];
      const category = getFeedCategory(url);
      const items: NewsItem[] = [];

      const selectors = [
        '.post',
        '.entry',
        '.article',
        '.news-item',
        '[class*="post"]',
        '[class*="entry"]',
        '[class*="article"]',
        '[class*="news"]',
        'article',
        '.card',
        '.story',
        '.feed-item',
        '.list-item',
        '.item',
        'li[class*="post"]',
        'div[class*="post"]',
      ];

      for (const selector of selectors) {
        const elements = safeQuerySelectorAll(html, selector);
        if (elements.length > 0) {
          elements.forEach((element, i) => {
            const item = this.extractItem(element as Element, sourceName, category, i, url);
            if (item) {
              items.push(item);
            }
          });
          break;
        }
      }

      if (items.length === 0) {
        const headingLinks = html.querySelectorAll('h1 a, h2 a, h3 a, h4 a');
        const seen = new Set<string>();
        headingLinks.forEach((link, i) => {
          const title = (link.textContent || '').trim();
          const href = (link.getAttribute('href') || '').trim();
          if (!title || !href || seen.has(href)) return;
          seen.add(href);
          let summary = '';
          const parent = link.closest('div, article, li, section');
          if (parent) {
            const p = parent.querySelector('p');
            if (p) summary = RSSParser.cleanText(p.textContent || '').substring(0, 300);
          }
          items.push({
            id: `${sourceName}-fallback-${i}`,
            title: title.substring(0, 300),
            summary,
            date: 'Recent',
            url: href.startsWith('http') ? href : new URL(href, url).href,
            source: sourceName,
            category,
            _ts: Date.now(),
          });
        });
      }

      return {
        items,
        source: {
          name: sourceName,
          status: items.length > 0 ? 'success' : 'failed',
          url,
          category,
          reason: items.length > 0 ? undefined : 'HTML page parsed but no article elements found',
          articleCount: items.length,
          checkedAt: new Date().toISOString()
        }
      };
    } catch {
      return null;
    }
  }

  private static extractItem(element: Element, sourceName: string, category: 'Centrist' | 'Left-wing' | 'Right-wing' | 'State-Controlled', index: number, baseUrl: string): NewsItem | null {
    const titleSelectors = ['h1', 'h2', 'h3', '.title', '[class*="title"]'];
    const linkSelectors = ['a', '[href]'];
    const contentSelectors = ['p', '.content', '.summary', '[class*="content"]'];

    let title = '';
    let link = '';
    let summary = '';

    for (const selector of titleSelectors) {
      const el = safeQuerySelector(element, selector);
      if (el?.textContent?.trim()) {
        title = RSSParser.cleanText(el.textContent);
        break;
      }
    }

    for (const selector of linkSelectors) {
      const el = safeQuerySelector(element, selector);
      if (el) {
        link = el.getAttribute('href') || '';
        if (link && !link.startsWith('http')) {
          try {
            link = new URL(link, baseUrl).href;
          } catch {
            // Invalid
          }
        }
        break;
      }
    }

    for (const selector of contentSelectors) {
      const el = safeQuerySelector(element, selector);
      if (el?.textContent?.trim()) {
        summary = el.textContent.trim().replace(/<[^>]*>/g, '').substring(0, 300);
        break;
      }
    }

    if (!title || !link) return null;

    const sourceCountry = getSourceCountry(baseUrl);
    const topicCountries = extractTopicCountries(`${title} ${summary}`);
    return {
      id: `${sourceName}-${index}-${Date.now()}`,
      title: title.substring(0, 300),
      summary,
      date: 'Recent',
      url: link,
      source: sourceName,
      category,
      imageUrl: this.extractImage(element),
      country: topicCountries.length > 0 ? topicCountries[0] : sourceCountry,
      topicCountries
    };
  }

  private static extractImage(element: Element): string | undefined {
    const img = safeQuerySelector(element, 'img');
    return img?.getAttribute('src') || undefined;
  }
}

const PROXY_STRATEGIES: ((encodedUrl: string) => string)[] = [
  (enc) => `/api/proxy?url=${enc}`,
  (enc) => `https://api.allorigins.win/raw?url=${enc}`,
  (enc) => `https://api.allorigins.win/get?url=${enc}`,
  (enc) => `https://corsproxy.io/?url=${enc}`,
  (enc) => `https://api.codetabs.com/v1/proxy?quest=${enc}`,
  (enc) => `https://thingproxy.freeboard.io/fetch/${dec(enc)}`,
  (enc) => `https://rss2json.com/v1/api.json?rss_url=${dec(enc)}`,
];

function tryParseRss2Json(text: string, url: string): { items: NewsItem[]; source: NewsSource } | null {
  if (!text || typeof text !== 'string') return null;
  const trimmed = text.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return null;
  try {
    const parsed = JSON.parse(trimmed);
    if (!parsed || !Array.isArray(parsed.items)) return null;
    const sourceName = RSS_CREDITS[url] || new URL(url).hostname.replace('www.', '').split('.')[0];
    const category = getFeedCategory(url);
    const items: NewsItem[] = parsed.items.slice(0, 20).map((it: any, idx: number) => ({
      id: `${sourceName}-r2j-${idx}-${Date.now()}`,
      title: RSSParser.cleanText(it.title || ''),
      summary: RSSParser.cleanText(it.description || it.summary || '').substring(0, 300),
      date: it.pubDate || 'Recent',
      url: it.link || it.url || url,
      source: sourceName,
      category,
      imageUrl: it.thumbnail || it.enclosure?.link || undefined,
      country: getSourceCountry(url),
    }));
    const sourceCountry = getSourceCountry(url);
    return { items, source: { name: sourceName, status: items.length > 0 ? 'success' : 'failed', url, category, country: sourceCountry } };
  } catch {
    return null;
  }
}

async function tryParseJsonFeed(text: string, url: string): Promise<{ items: NewsItem[]; source: NewsSource } | null> {
  return JsonFeedParser.parse(text, url);
}

const FETCH_TIMEOUT_MS = 20000;
const MAX_RESPONSE_BYTES = 2 * 1024 * 1024;

function dec(enc: string): string {
  try { return decodeURIComponent(enc); } catch { return enc; }
}

async function tryParseWithRssParser(text: string, url: string): Promise<{ items: NewsItem[]; source: NewsSource } | null> {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, 'text/xml');
    if (xmlDoc.querySelector('parsererror')) return null;

    const sourceName = RSS_CREDITS[url] || new URL(url).hostname.replace('www.', '').split('.')[0];
    const category = getFeedCategory(url);
    const sourceCountry = getSourceCountry(url);

    const elements = Array.from(xmlDoc.querySelectorAll('item, entry'));
    if (elements.length === 0) return null;

    const items: NewsItem[] = elements.slice(0, 20).map((item, idx) => {
      const title = item.querySelector('title')?.textContent?.trim() || '';
      const summary = (
        item.querySelector('description, summary, content, content\\:encoded')?.textContent?.trim() || ''
      ).replace(/<[^>]*>/g, '').substring(0, 300);
      const link = item.querySelector('link')?.textContent?.trim() || item.querySelector('link')?.getAttribute('href') || url;
      const pubDate = item.querySelector('pubDate, published, updated, date')?.textContent?.trim() || 'Recent';

      return {
        id: `${sourceName}-domparsed-${idx}-${Date.now()}`,
        title: RSSParser.cleanText(title),
        summary: RSSParser.cleanText(summary),
        date: pubDate,
        url: link,
        source: sourceName,
        category,
        country: sourceCountry,
        topicCountries: extractTopicCountries(`${title} ${summary}`),
        _ts: Date.now(),
      };
    });

    return {
      items,
      source: {
        name: sourceName,
        status: 'success',
        url,
        category,
        articleCount: items.length,
        checkedAt: new Date().toISOString(),
        country: sourceCountry,
      },
    };
  } catch {
    return null;
  }
}

function classifyFetchError(err: unknown): string {
  if (err instanceof Error) {
    if (err.name === 'AbortError' || err.message.includes('Timeout')) {
      return 'Timeout';
    }
    if (err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
      return 'Network error';
    }
    if (err.message.includes('CORS')) {
      return 'CORS policy blocks feed access';
    }
    return err.message;
  }
  return String(err);
}

async function fetchFeedText(url: string): Promise<string> {
  const enc = encodeURIComponent(url);
  const errors: { endpoint: string; error: string }[] = [];

  for (let i = 0; i < PROXY_STRATEGIES.length; i++) {
    const endpoint = PROXY_STRATEGIES[i](enc);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const response = await fetch(endpoint, {
        signal: controller.signal,
        headers: { Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*' },
        redirect: 'follow',
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        const err = `HTTP ${response.status}`;
        errors.push({ endpoint, error: err });
        continue;
      }

      const cl = response.headers.get('content-length');
      if (cl && parseInt(cl, 10) > MAX_RESPONSE_BYTES) {
        errors.push({ endpoint, error: `Response too large (${cl} bytes)` });
        continue;
      }

      const buffer = await response.arrayBuffer();
      if (buffer.byteLength > MAX_RESPONSE_BYTES) {
        errors.push({ endpoint, error: 'Response too large (>2MB)' });
        continue;
      }

      const text = decodeResponse(buffer, response.headers.get('content-type') || '');
      if (text && text.trim().length > 0) return text;
      errors.push({ endpoint, error: 'Empty payload' });
    } catch (err) {
      clearTimeout(timeoutId);
      const classified = classifyFetchError(err);
      errors.push({ endpoint, error: classified });
    }

    if (i < PROXY_STRATEGIES.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }

  const details = errors.map((e) => `${e.endpoint}: ${e.error}`).join(' | ');
  throw new Error(`All proxies failed for ${url}: ${details}`);
}

function decodeResponse(buffer: ArrayBuffer, contentType: string): string {
  const uint8 = new Uint8Array(buffer);

  if (uint8.length >= 2) {
    if (uint8[0] === 0xff && uint8[1] === 0xfe) {
      return new TextDecoder('utf-16le').decode(uint8);
    }
    if (uint8[0] === 0xfe && uint8[1] === 0xff) {
      return new TextDecoder('utf-16be').decode(uint8);
    }
  }

  const charsetMatch = contentType.match(/charset=([^;]+)/i);
  if (charsetMatch) {
    const charset = charsetMatch[1].trim().toLowerCase();
    if (charset.includes('utf-16')) {
      const hasNulls = uint8.some((b, i) => i % 2 === 1 && b === 0x00);
      if (hasNulls) {
        return new TextDecoder('utf-16le').decode(uint8);
      }
      return new TextDecoder('utf-8').decode(uint8);
    }
  }

  return new TextDecoder('utf-8').decode(uint8);
}

async function fetchSingleFeed(url: string): Promise<FeedResult> {
  const sourceName = RSS_CREDITS[url] || new URL(url).hostname.replace('www.', '').split('.')[0];
  const category = getFeedCategory(url);

  const cached = feedCache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return {
      success: true,
      items: cached.data,
      source: {
        name: sourceName,
        status: 'success',
        url,
        category,
        reason: 'Served from cache',
        articleCount: cached.data.length,
        checkedAt: new Date().toISOString(),
      },
    };
  }

  const urlsToTry = [url, ALT_URLS[url]].filter(Boolean) as string[];
  const feedErrors: { url: string; error: string }[] = [];

  for (const tryUrl of urlsToTry) {
    try {
      const text = await fetchFeedText(tryUrl);
      let result = RSSParser.parseFeed(text, tryUrl);

      if (!result || result.items.length === 0) {
        const jf = await tryParseJsonFeed(text, tryUrl);
        if (jf && jf.items.length > 0) {
          result = jf;
        } else {
          const rp = await tryParseWithRssParser(text, tryUrl);
          if (rp && rp.items.length > 0) {
            result = rp;
          } else {
            const r2j = tryParseRss2Json(text, tryUrl);
            if (r2j && r2j.items.length > 0) {
              result = r2j;
            } else {
              const htmlResult = HTMLParser.parse(text, tryUrl);
              if (htmlResult && htmlResult.items.length > 0) {
                result = htmlResult;
              } else if (!result || result.items.length === 0) {
                feedErrors.push({ url: tryUrl, error: 'Feed parsed but contained no items' });
                continue;
              }
            }
          }
        }
      }

      if (result && result.items.length > 0) {
        feedCache.set(url, { data: result.items, timestamp: Date.now() });
        return {
          success: true,
          items: result.items,
          source: {
            ...result.source,
            name: sourceName,
            status: 'success',
            url: tryUrl,
            category,
          },
        };
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      feedErrors.push({ url: tryUrl, error: msg });
    }
  }

  const primaryError = feedErrors[0]?.error || 'Unknown error';
  const errorSummary = feedErrors.map((e) => `${e.url}: ${e.error}`).join(' -> ');
  console.warn(`Feed fetch failed for ${sourceName} (${url}). Attempts: ${errorSummary}`);

  let reason = 'Unknown failure';
  if (primaryError.includes('Timeout')) {
    reason = 'The source took too long to respond and was timed out. It may be slow, blocked, or unreachable.';
  } else if (primaryError.includes('Network error') || primaryError.includes('Failed to fetch')) {
    reason = 'The network request failed. The source may be offline, DNS-unresolvable, or blocked by a proxy.';
  } else if (primaryError.includes('CORS')) {
    reason = 'The source denies cross-origin access and no working proxy was available to relay it.';
  } else if (primaryError.startsWith('HTTP ')) {
    reason = 'The source responded with an HTTP error status, so the feed could not be read.';
  } else if (primaryError.includes('All proxies failed')) {
    reason = 'All fetch strategies (direct + proxy chain) failed for this source.';
  } else if (primaryError.includes('Feed parsed but contained no items')) {
    reason = 'The feed was parsed but contained zero items. The source may have changed format or be temporarily empty.';
  } else {
    reason = 'An unexpected error occurred while fetching this source.';
  }

  return {
    success: false,
    items: [],
    source: {
      name: sourceName,
      status: 'failed',
      url,
      category,
      error: primaryError.substring(0, 120),
      reason,
      articleCount: 0,
      checkedAt: new Date().toISOString(),
    },
  };
}

const NEWS_WINDOW_MS = 2 * 24 * 60 * 60 * 1000;

function filterAndSort(items: NewsItem[]): NewsItem[] {
  const cutoff = Date.now() - NEWS_WINDOW_MS;
  const filtered = items.filter((item) => {
    const ts = item._ts ?? Date.now();
    return ts >= cutoff;
  });
  filtered.sort((a, b) => (b._ts ?? 0) - (a._ts ?? 0));
  return filtered;
}

export type FeedUpdate = (
  articles: NewsItem[],
  sources: NewsSource[],
  done: boolean
) => void;

export async function fetchAviationNews(
  onFeedResolved?: FeedUpdate,
  onProgress?: (source: string, count: number) => void
): Promise<{ articles: NewsItem[]; sources: NewsSource[] }> {
  const newsItems: NewsItem[] = [];
  const sourcesInfo: NewsSource[] = [];
  let resolved = 0;
  const total = AVIATION_RSS_URLS.length;

  await runWithConcurrency(
    AVIATION_RSS_URLS.map((url) => async () => {
      const result = await fetchSingleFeed(url);
      if (onProgress) onProgress(result.source.name, result.items.length);

      newsItems.push(...result.items);
      sourcesInfo.push(result.source);
      resolved++;

      if (onFeedResolved) {
        onFeedResolved(filterAndSort(newsItems), sourcesInfo, resolved === total);
      }
    }),
    MAX_CONCURRENCY
  );

  return { articles: filterAndSort(newsItems), sources: sourcesInfo };
}

export async function fetchWorldNews(
  onFeedResolved?: FeedUpdate,
  onProgress?: (progress: number, source: string) => void
): Promise<{ articles: NewsItem[]; sources: NewsSource[] }> {
  const newsItems: NewsItem[] = [];
  const sourcesInfo: NewsSource[] = [];
  let resolved = 0;
  const total = WORLD_NEWS_URLS.length;

  await runWithConcurrency(
    WORLD_NEWS_URLS.map((url) => async () => {
      const result = await fetchSingleFeed(url);
      if (onProgress) onProgress(0, result.source.name);

      newsItems.push(...result.items);
      sourcesInfo.push(result.source);
      resolved++;

      if (onFeedResolved) {
        onFeedResolved(filterAndSort(newsItems), sourcesInfo, resolved === total);
      }
    }),
    MAX_CONCURRENCY
  );

  return { articles: filterAndSort(newsItems), sources: sourcesInfo };
}

export async function fetchAllNews(
  onFeedResolved?: FeedUpdate,
  onProgress?: (progress: number, source: string) => void
): Promise<{ articles: NewsItem[]; sources: NewsSource[] }> {
  const newsItems: NewsItem[] = [];
  const sourcesInfo: NewsSource[] = [];
  let resolved = 0;
  const total = WORLD_NEWS_URLS.length + AVIATION_RSS_URLS.length;

  await runWithConcurrency(
    [...WORLD_NEWS_URLS, ...AVIATION_RSS_URLS].map((url) => async () => {
      const result = await fetchSingleFeed(url);
      if (onProgress) onProgress(0, result.source.name);

      newsItems.push(...result.items);
      sourcesInfo.push(result.source);
      resolved++;

      if (onFeedResolved) {
        onFeedResolved(filterAndSort(newsItems), sourcesInfo, resolved === total);
      }
    }),
    MAX_CONCURRENCY
  );

  return { articles: filterAndSort(newsItems), sources: sourcesInfo };
}

export function distinctSources(articles: NewsItem[]): string[] {
  return Array.from(new Set(articles.map((a) => a.source))).sort((a, b) =>
    a.localeCompare(b)
  );
}

export function searchArticles(articles: NewsItem[], query: string): NewsItem[] {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return articles;
  return articles.filter((a) => {
    const hay = `${a.title} ${a.summary} ${a.source}`.toLowerCase();
    return terms.every((t) => hay.includes(t));
  });
}

export function filterByWindow(articles: NewsItem[], windowMs: number): NewsItem[] {
  if (!windowMs || windowMs <= 0) return articles;
  const cutoff = Date.now() - windowMs;
  return articles.filter((a) => (a._ts ?? Date.now()) >= cutoff);
}

export { AVIATION_RSS_URLS, WORLD_NEWS_URLS, decodeResponse, fetchSingleFeed };
