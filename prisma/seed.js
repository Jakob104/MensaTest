const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starte Datenbank-Update...');

  // 1. ALLES LÖSCHEN (Aufräumen)
  await prisma.weeklyEntry.deleteMany();
  await prisma.dish.deleteMany();
  await prisma.product.deleteMany();
  
  // -----------------------------------------------------------
  // 🔽 HIER DEINE LISTE AUS EXCEL EINFÜGEN (ZWISCHEN DIE ` `)
  // -----------------------------------------------------------
  const rawList = `
Spaghetti Bolognese mit Salat ACGS
Faschierte Laibchen mit Kartoffelpüree ACGS
Gefüllte Paprika mit Reis ACS
Chili con carne ACS
Hascheehörnchen mit Salat ACS
Lasagne mit Salat ACGS
Spaghetti Carbonara ACGS
Schweinsbraten mit Erbsenreis AS
Paprikaschnitzel mit Spiralen ACS
Reisfleisch mit Salat S
Knacker mit Rahmgemüse und Kartoffel AGS
Knacker mit Erdäpfel und Kochsalat AGS
Leberkäse mit Rahmfisolen und Rösti AGS
Cevapcici mit Reis und Salat ACF
Gnocchi Carbonara (PUTE) mit Salat AG
Erdäpfelgulasch AS
Penne Schinkenrahmsauce mit Salat ACGS
Spinatspätzle Überbacken  mit Salat ACGS
Naturschnitzel mit Gemüsereis AS
Wurstknödel mit Salat ACS
Wurstfleckerl mit Salat ACS
Krautfleisch  mit Salzkartoffel AGS
Schinkenfleckerl mit Salat ACS
Champignonschnitzel mit Reis AGS
Schweinsgeschnetzeltes mit Reis AGS
Geselchtes mit Kartoffelpüree GS
Nockerl in Schinkenrahmsauce ACGS
Tiroler Gröstl mit Salat S
Fleischbällchen in Tomatensauce mit Reis AS
Specklinsen mit Knödel ACGHS
Berner Würstel mit Kartoffelpüree AGS
Überbackene Fleischpalatschinken mit Salat ACGS
Selfmade Burger mit Wedges AMNC
Chicken Burger mit Wedges AMNC
Boeff Stroganoff(Rind) mit Cremiger Polenta AG
Rindsgulasch mit Nockerl AC
Rindfleisch mit Rahmfisolen und Erdäpfel AG
Penne Bolognese (RIND) mit Salat ACG
Gekochtes Rindfleisch mit Schnittlauchsauce und Rösti ACGL
Gekochtes Rindfleisch mit Dillerdäpfeln AGL
Saftrindschnitzel mit Spiralen ACG
Rindragout mit Spiralen ACGL
Erdäpfelgulasch mit Putenfrankfurter A
Pikante Schupfnudeln in Sahne-Schinken-Erbsen Sauce und Salat AG
Buntes Putengeschnetzeltes mit Penne ACG
Putenknacker mit Kochsalat und Rösti A
Putenfilet überbacken mit Petersilkartoffel AG
Putengeschnetzeltes mit Reis AG
Putenschnitzel natur mit Erbsenreis A
Putengulasch mit Nockerl ACG
Putenreisfleisch mit Salat 
Putenschinkenfleckerl mit grünem Salat AC
Puten-Champignon-Ragout mit Reis AG
Asiatische Hühnerpfanne mit Reis F
Huhn-Gemüse-Kokos Curry mit Reis AGL
Curryreis mit Huhn und Erbsen
Überbackenes Hühnerfilet mit Kartoffel AG
Champignonschnitzel vom Huhn mit Reis AG
Rotes Thai Curry vom Huhn mit Reis AG
Hühnerpaella mit Salat 
Hühnersticks mit Reis und Salat 
Hühnerfilet Natur mit Erbsenreis AG
Tagliatelle mit Lachsrahmsauce ACDG
Fischstäbchen mit Kartoffelsalat ADL
Seelachsfilet natur mit Petersilkartoffel ADG
Seehechtnuggets mit Kartoffelsalat ADL
Pangasiusfilet gebacken mit Salat ACDGL
Fischfilet mit Kartoffel-Gemüse-Gratin ACGD
Seelachs geb. mit Salat ACDGL
Fischfilet mit Erdäpfelgratin ACDG
Fischfilet natur mit Petersilkartoffel ACDG
Fischlaibchen mit Petersilerdäpfel ACD
Fischpaella AD
Fischfilet mit Kürbiskernkruste ADG
Fischfilet mit Kartoffelkruste ACDG
Überbackenes Fischfilet mit Petersilkartoffel ADG
Apfelstrudel mit Vanillesauce AFG
Apfel-Zimt Fleckerl AG
Bärlauchknödel mit Butterbrösel ACG
Brokkoliauflauf mit Salat ACG
Brokkoli-Cheesenuggets mit Kräutersauce ACG
Bröselnudeln mit Apfelmus ACG
Bulgur - Schafskäseauflauf ACGL
Bunte Ebly Pfanne mit Tomatensalat ACG
Bunte Gemüsepfanne mit Kartoffel
Buntes Erdäpfel Gröstl mit Salat L
Champignonsauce mit Knödel ACGO
Cremespinat mit Rösti und Ei ACG
Eiernockerl mit Salat ACGL
Erdäpfelstrudel mit Joghurtsauce und Salat ACFGHN
Frischkäsetaschen mit Salat und Krätuersauce ACGLN
Gebackener Reisauflauf mit Zimtzucker ACG
Gemüseauflauf ACG
Gemüse-Kokos Curry mit Reis und Tofu AG
Gemüselaibchen mit Kräutersauce und Salat ACGL
Gemüsebällchen mit Kräuterdip und Salat CG
Gemüselasagne mit Salat ACGL
Gemüserisotto GL
Gemüsestrudel mit Knoblauchsauce ACFGL
Gemüsestrudel mit Kräutersauce ACFGHN
Geröstete Knödel mit Rotem Rübensalat ACGL
Gnocchi in Gorgonzolasauce mit Salat AGL
Gnocchi in Eierschwammerl - Sahne und Blattspinat AGL
Hirseauflauf mit Karotten, Erbsen und Salat ACG
Karfiol-Käse-Laibchen mit Tomaten-Gurken-Salat ACG
Kartoffel-Gemüse-Gratin ACGL
Kartoffel-Kürbisstrudel mit Salat ACFGHN
Kartoffelpuffer mit Knoblauchsauce AG
Käsespätzle mit grünem Salat ACG
Käsespätzle mit Salat ACG
Kochsalat mit Röstinchen und Ei ACG
Krautfleckerl AC
Kürbisrisotto GL
Kürbisstrudel mit Kräutersauce ACG
Lauch-Obers Tagliatelle ACGL
Makkeroni m. Gemüsebolognese ACGL
Marmeladepalatschinken ACG
Mediteranes Gemüse mit Kräuterkartoffel G
Mohnnudeln mit Apfelmus ACG
Nougatknödel ACFGH
Nudel-Gemüseauflauf mit Salat ACG
Nussnudeln mit Apfelmus ACGH
Obstknödel ACEFG
Pasta Prima Vera ACGL
Penne á la Romana AC
Penne Arabiata AC
Polentataler mit Ratatouille G
Powidltascherl ACFHO
Quinoa - Gemüse - Auflauf mit Salat ACG
Ravioli in Tomaten- Basilikumsaucesauce ACG
Scheiterhaufen ACG
Schulfrei
Spaghetti a la Funghi mit Salat ACGO
Spaghetti mit Petersilpesto und Salat ACGH
Spaghetti mit Tomatenpesto und Salat ACGH
Spinat mit Rösti und Ei ACG
Spinat-Kartoffel-Gratin ACG
Spinatlasagne ACGL
Spinatstrudel mit Tzatziki und Salat ACFGHN
Tarte au Ratatouille ACGL
Tomate-Mozzarella Gnocci Auflauf ACG
Tomaten-Zucchini Lasagne ACGL
Topfenknödel mit Fruchtsauce ACG
Topfentascherl mit Fruchtsauce ACFGH
Tortellini mit Gemüsesauce ACFG
Überbackene Gemüsefleckerl mit Salat ACG
Überbackene Spinatpalatschinken ACG
Überbackene Topfenpalatschinken ACG
Veg. Nockerlpfanne mit Salat ACG
Vegetarisches Erdäpfelgulasch A
Vegane Nougatknödel AFH
Vegetarisches Chilli (Tofu) AF
Veggie Burger mit Wedges AMNCL
Wokgemüse mit Reis F
Zuchini - Feta - Erdäfel Auflauf mit Salat ACG
Zuchinipuffer mit Tomatensalat ACGL
  `;
  // -----------------------------------------------------------
  // 🔼 EINFACH DEINE GANZE SPALTE REINKOPIEREN
  // -----------------------------------------------------------

  // Das Skript macht aus dem Text eine Liste
  const dishNames = rawList.split('\n').filter(line => line.trim() !== '');

  console.log(`👨‍🍳 Gefunden: ${dishNames.length} Gerichte.`);

  // 2. MITTAGESSEN ANLEGEN (Alle 5,20 €)
  for (const name of dishNames) {
      await prisma.dish.create({
          data: {
              name: name.trim(),
              description: 'Frisch gekocht', // Standard-Beschreibung
              price: 5.20
          }
      });
  }
  console.log('✅ Mittagessen wurden angelegt.');


  // 3. KIOSK SNACKS (Bleiben fix)
  const products = [
    { name: 'Schnitzelsemmel', description: 'Huhn', price: 3.50, category: 'Weckerl' },
    { name: 'Käseweckerl', description: 'Gouda', price: 2.80, category: 'Weckerl' },
    { name: 'Wurstsemmel', description: 'Extrawurst', price: 2.50, category: 'Weckerl' },
    { name: 'Coca Cola', description: '0.5l', price: 1.80, category: 'Getraenk' },
    { name: 'Eistee Pfirsich', description: '0.5l', price: 1.80, category: 'Getraenk' },
    { name: 'Mineralwasser', description: '0.5l', price: 1.20, category: 'Getraenk' },
    { name: 'Schokomuffin', description: 'Hausgemacht', price: 1.50, category: 'Snack' },
    { name: 'Apfel', description: 'Gesund', price: 0.80, category: 'Snack' },
  ];

  for (const p of products) {
    await prisma.product.create({ data: p });
  }
  console.log('🥨 Snacks wurden angelegt.');

  console.log('🏁 Fertig!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });