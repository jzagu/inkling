﻿// wordsFtoJ words from Scrabble dictionary
const wordsFtoJ = [
  // F words
  "fabled", "fabler", "fables", "fabric", "facade", "facers", "facete", "facets", "faceup", "facial",
  "facias", "facies", "facile", "facing", "factor", "facula", "fadein", "faders", "fadged", "fadges",
  "fading", "faecal", "faeces", "faenas", "faerie", "fagged", "faggot", "fagins", "fagots", "failed",
  "faille", "fainer", "faints", "faired", "fairer", "fairly", "faiths", "fajita", "fakeer", "fakers",
  "fakery", "faking", "fakirs", "falces", "falcon", "fallal", "fallen", "faller", "fallow", "falser",
  "falsie", "falter", "family", "famine", "faming", "famish", "famous", "famuli", "fandom", "fanega",
  "fangas", "fanged", "fanion", "fanjet", "fanned", "fanner", "fanons", "fantod", "fantom", "fanums",
  "faqirs", "faquir", "farads", "farced", "farcer", "farces", "farcie", "farded", "fardel", "farers",
  "farfal", "farfel", "farina", "faring", "farles", "farmed", "farmer", "farrow", "farted", "fasces",
  "fascia", "fashed", "fashes", "fasted", "fasten", "faster", "father", "fathom", "fating", "fatsos",
  "fatted", "fatten", "fatter", "fatwas", "faucal", "fauces", "faucet", "faulds", "faults", "faulty",
  "faunae", "faunal", "faunas", "fauves", "favela", "favism", "favors", "favour", "fawned", "fawner",
  "faxing", "faying", "fazing", "fealty", "feared", "fearer", "feased", "feases", "feasts", "feater",
  "featly", "feazed", "feazes", "fecial", "feckly", "fecula", "fecund", "fedora", "feeble", "feebly",
  "feeder", "feeing", "feeler", "feezed", "feezes", "feigns", "feijoa", "feints", "feirie", "feists",
  "feisty", "felids", "feline", "fellah", "fellas", "felled", "feller", "felloe", "fellow", "felons",
  "felony", "felted", "female", "femmes", "femora", "femurs", "fenced", "fencer", "fences", "fended",
  "fender", "fennec", "fennel", "feoffs", "ferbam", "feriae", "ferial", "ferias", "ferine", "ferity",
  "ferlie", "fermis", "ferrel", "ferret", "ferric", "ferrum", "ferula", "ferule", "fervid", "fervor",
  "fescue", "fessed", "fesses", "festal", "fester", "fetial", "fetich", "feting", "fetish", "fetors",
  "fetted", "fetter", "fettle", "feuars", "feudal", "feuded", "feuing", "fevers", "fewest", "feyest",
  "fezzed", "fezzes", "fiacre", "fiance", "fiasco", "fibbed", "fibber", "fibers", "fibres", "fibril",
  "fibrin", "fibula", "fiches", "fichus", "ficins", "fickle", "fickly", "ficoes", "fiddle", "fiddly",
  "fidged", "fidges", "fidget", "fields", "fiends", "fierce", "fiesta", "fifers", "fifing", "fifths",
  "figged", "fights", "figure", "filers", "filets", "filial", "filing", "filled", "filler", "filles",
  "fillet", "fillip", "fillos", "filmed", "filmer", "filmic", "filose", "filses", "filter", "filths",
  "filthy", "fimble", "finale", "finals", "finder", "finely", "finery", "finest", "finger", "finial",
  "fining", "finish", "finite", "finked", "finned", "fiords", "fipple", "fiques", "firers", "firing",
  "firkin", "firman", "firmed", "firmer", "firmly", "firsts", "firths", "fiscal", "fished", "fisher",
  "fishes", "fisted", "fistic", "fitchy", "fitful", "fitted", "fitter", "fivers", "fixate", "fixers",
  "fixing", "fixity", "fixure", "fizgig", "fizzed", "fizzer", "fizzes", "fizzle", "fjelds", "fjords",
  "flabby", "flacks", "flacon", "flaggy", "flagon", "flails", "flairs", "flaked", "flaker", "flakes",
  "flakey", "flambe", "flamed", "flamen", "flamer", "flames", "flanes", "flange", "flanks", "flappy",
  "flared", "flares", "flashy", "flasks", "flatly", "flatus", "flaunt", "flavin", "flavor", "flawed",
  "flaxen", "flaxes", "flayed", "flayer", "fleams", "fleche", "flecks", "flecky", "fledge", "fledgy",
  "fleece", "fleech", "fleecy", "fleers", "fleets", "flench", "flense", "fleshy", "fletch", "fleury",
  "flexed", "flexes", "flexor", "fleyed", "flicks", "fliers", "fliest", "flight", "flimsy", "flinch",
  "flings", "flints", "flinty", "flippy", "flirts", "flirty", "flitch", "flited", "flites", "floats",
  "floaty", "flocci", "flocks", "flocky", "flongs", "floods", "flooey", "flooie", "floors", "floosy",
  "floozy", "floppy", "florae", "floral", "floras", "floret", "florid", "florin", "flossy", "flotas",
  "flours", "floury", "flouts", "flowed", "flower", "fluent", "fluffs", "fluffy", "fluids", "fluked",
  "flukes", "flukey", "flumed", "flumes", "flumps", "flunks", "flunky", "fluors", "flurry", "fluted",
  "fluter", "flutes", "flutey", "fluxed", "fluxes", "fluyts", "flyboy", "flybys", "flyers", "flying",
  "flyman", "flymen", "flyoff", "flysch", "flyted", "flytes", "flyway", "foaled", "foamed", "foamer",
  "fobbed", "fodder", "fodgel", "foehns", "foeman", "foemen", "foetal", "foetid", "foetor", "foetus",
  "fogbow", "fogdog", "fogeys", "fogged", "fogger", "fogies", "foible", "foiled", "foined", "foison",
  "foists", "folate", "folded", "folder", "foliar", "folios", "folium", "folkie", "folksy", "folles",
  "follis", "follow", "foment", "fomite", "fonded", "fonder", "fondle", "fondly", "fondue", "fondus",
  "fontal", "foodie", "fooled", "footed", "footer", "footie", "footle", "footsy", "foozle", "fopped",
  "forage", "forams", "forays", "forbad", "forbid", "forbye", "forced", "forcer", "forces", "forded",
  "fordid", "foreby", "foredo", "forego", "forest", "forgat", "forged", "forger", "forges", "forget",
  "forgot", "forint", "forked", "forker", "formal", "format", "formed", "formee", "former", "formes",
  "formic", "formol", "formyl", "fornix", "forrit", "fortes", "fortis", "forums", "forwhy", "fossae",
  "fossas", "fosses", "fossil", "foster", "fought", "fouled", "fouler", "foully", "founds", "founts",
  "fourth", "foveae", "foveal", "foveas", "fowled", "fowler", "foxier", "foxily", "foxing", "foyers",
  "fozier", "fracas", "fracti", "fraena", "frails", "fraise", "framed", "framer", "frames", "francs",
  "franks", "frappe", "frater", "frauds", "frayed", "frazil", "freaks", "freaky", "freely", "freers",
  "freest", "freeze", "french", "frenum", "frenzy", "freres", "fresco", "fretty", "friars", "friary",
  "fridge", "friend", "friers", "frieze", "fright", "frigid", "frijol", "frills", "frilly", "fringe",
  "fringy", "frisee", "frises", "frisks", "frisky", "friths", "fritts", "frivol", "frized", "frizer",
  "frizes", "frizzy", "frocks", "froggy", "frolic", "fronds", "fronts", "frosts", "frosty", "froths",
  "frothy", "frouzy", "frowns", "frowst", "frowsy", "frowzy", "frozen", "frugal", "fruits", "fruity",
  "frumps", "frumpy", "frusta", "fryers", "frying", "frypan", "fubbed", "fucked", "fucker", "fuckup",
  "fucoid", "fucose", "fucous", "fuddle", "fudged", "fudges", "fueled", "fueler", "fugato", "fugged",
  "fugios", "fugled", "fugles", "fugued", "fugues", "fuhrer", "fulcra", "fulfil", "fulgid", "fulham",
  "fullam", "fulled", "fuller", "fulmar", "fumble", "fumers", "fumets", "fumier", "fuming", "fumuli",
  "funded", "fundic", "fundus", "funest", "fungal", "fungic", "fungus", "funked", "funker", "funkia",
  "funned", "funnel", "funner", "furane", "furans", "furfur", "furies", "furled", "furler", "furore",
  "furors", "furred", "furrow", "furzes", "fusain", "fusees", "fusels", "fusile", "fusils", "fusing",
  "fusion", "fussed", "fusser", "fusses", "fustic", "futile", "futons", "future", "futzed", "futzes",
  "fuzees", "fuzils", "fuzing", "fuzzed", "fuzzes", "fylfot", "fyttes",

  // G words
  "gabbed", "gabber", "gabble", "gabbro", "gabies", "gabion", "gabled", "gables", "gaboon", "gadded",
  "gadder", "gaddis", "gadfly", "gadget", "gadids", "gadoid", "gaeing", "gaffed", "gaffer", "gaffes",
  "gagaku", "gagers", "gagged", "gagger", "gaggle", "gaging", "gagman", "gagmen", "gaiety", "gaijin",
  "gained", "gainer", "gainly", "gainst", "gaited", "gaiter", "galago", "galahs", "galaxy", "galeae",
  "galeas", "galena", "galere", "galiot", "galled", "gallet", "galley", "gallic", "gallon", "gallop",
  "gallus", "galoot", "galops", "galore", "galosh", "galyac", "galyak", "gamays", "gambas", "gambes",
  "gambia", "gambir", "gambit", "gamble", "gambol", "gamely", "gamers", "gamest", "gamete", "gamier",
  "gamily", "gamine", "gaming", "gamins", "gammas", "gammed", "gammer", "gammon", "gamuts", "gander",
  "ganefs", "ganevs", "ganged", "ganger", "gangly", "gangue", "ganjah", "ganjas", "gannet", "ganofs",
  "ganoid", "gantry", "gaoled", "gaoler", "gapers", "gaping", "gapped", "garage", "garbed", "garble",
  "garcon", "garden", "garget", "gargle", "garish", "garlic", "garner", "garnet", "garote", "garred",
  "garret", "garron", "garter", "garths", "garvey", "gasbag", "gascon", "gashed", "gasher", "gashes",
  "gasify", "gasket", "gaskin", "gaslit", "gasman", "gasmen", "gasped", "gasper", "gassed", "gasser",
  "gasses", "gasted", "gaster", "gateau", "gather", "gating", "gators", "gauche", "gaucho", "gauged",
  "gauger", "gauges", "gaults", "gaumed", "gauzes", "gavage", "gavels", "gavial", "gavots", "gawked",
  "gawker", "gawped", "gawper", "gawsie", "gayals", "gayest", "gayety", "gazabo", "gazars", "gazebo",
  "gazers", "gazing", "gazoos", "gazump", "geared", "gecked", "geckos", "geegaw", "geeing", "geests",
  "geezer", "geisha", "gelada", "gelant", "gelate", "gelati", "gelato", "gelded", "gelder", "gelees",
  "gelled", "gemmae", "gemmed", "gemote", "gemots", "gender", "genera", "genets", "geneva", "genial",
  "genies", "genips", "genius", "genoas", "genome", "genoms", "genres", "genros", "gentes", "gentil",
  "gentle", "gently", "gentoo", "gentry", "geodes", "geodic", "geoids", "gerahs", "gerbil", "gerent",
  "german", "germen", "gerund", "gestes", "gestic", "getter", "getups", "gewgaw", "geyser", "gharri",
  "gharry", "ghauts", "ghazis", "gherao", "ghetto", "ghibli", "ghosts", "ghosty", "ghouls", "ghylls",
  "giants", "giaour", "gibbed", "gibber", "gibbet", "gibbon", "gibers", "gibing", "giblet", "gibson",
  "giddap", "gieing", "gifted", "gigged", "giggle", "giggly", "giglet", "giglot", "gigolo", "gigots",
  "gigues", "gilded", "gilder", "gilled", "giller", "gillie", "gimbal", "gimels", "gimlet", "gimmal",
  "gimmes", "gimmie", "gimped", "gingal", "ginger", "gingko", "ginkgo", "ginned", "ginner", "gipons",
  "gipped", "gipper", "girded", "girder", "girdle", "girlie", "girned", "girons", "girted", "girths",
  "gismos", "gitano", "gittin", "givens", "givers", "giving", "gizmos", "glaces", "glacis", "glades",
  "gladly", "glaire", "glairs", "glairy", "glaive", "glamor", "glance", "glands", "glared", "glares",
  "glassy", "glazed", "glazer", "glazes", "gleams", "gleamy", "gleans", "glebae", "glebes", "gledes",
  "gleeds", "gleeks", "gleets", "gleety", "glegly", "gleyed", "glibly", "glided", "glider", "glides",
  "gliffs", "glimed", "glimes", "glints", "glioma", "glitch", "glitzy", "gloams", "gloats", "global",
  "globby", "globed", "globes", "globin", "gloggs", "glomus", "glooms", "gloomy", "gloppy", "gloria",
  "glossa", "glossy", "glosts", "glouts", "gloved", "glover", "gloves", "glowed", "glower", "glozed",
  "glozes", "glucan", "gluers", "gluier", "gluily", "gluing", "glumes", "glumly", "glumpy", "glunch",
  "gluons", "glutei", "gluten", "glycan", "glycin", "glycol", "glycyl", "glyphs", "gnarls", "gnarly",
  "gnarrs", "gnatty", "gnawed", "gnawer", "gneiss", "gnomes", "gnomic", "gnomon", "gnoses", "gnosis",
  "goaded", "goaled", "goalie", "goanna", "goatee", "gobang", "gobans", "gobbed", "gobbet", "gobble",
  "gobies", "goblet", "goblin", "goboes", "gobony", "goddam", "godded", "godets", "godown", "godson",
  "godwit", "gofers", "goffer", "goggle", "goggly", "goglet", "goings", "goiter", "goitre", "golden",
  "golder", "golems", "golfed", "golfer", "golosh", "gombos", "gomuti", "gonads", "gonefs", "goners",
  "gonged", "goniff", "gonifs", "gonion", "gonium", "gonofs", "gonoph", "goober", "goodby", "goodie",
  "goodly", "goofed", "googly", "googol", "gooier", "gooney", "goonie", "gooral", "goosed", "gooses",
  "goosey", "gopher", "gorals", "gorged", "gorger", "gorges", "gorget", "gorgon", "gorhen", "gorier",
  "gorily", "goring", "gorses", "gospel", "gossan", "gossip", "gothic", "gotten", "gouged", "gouger",
  "gouges", "gourde", "gourds", "govern", "gowans", "gowany", "gowned", "goyish", "graals", "grabby",
  "graben", "graced", "graces", "graded", "grader", "grades", "gradin", "gradus", "grafts", "graham",
  "grails", "grains", "grainy", "gramas", "gramme", "gramps", "grands", "grange", "granny", "grants",
  "granum", "grapes", "grapey", "graphs", "grappa", "grasps", "grassy", "grated", "grater", "grates",
  "gratin", "gratis", "graved", "gravel", "graven", "graver", "graves", "gravid", "grayed", "grayer",
  "grayly", "grazed", "grazer", "grazes", "grease", "greasy", "greats", "greave", "grebes", "greeds",
  "greedy", "greens", "greeny", "greets", "gregos", "greige", "gremmy", "greyed", "greyer", "greyly",
  "grided", "grides", "griefs", "grieve", "griffe", "griffs", "grifts", "grigri", "grille", "grills",
  "grilse", "grimed", "grimes", "grimly", "grinch", "grinds", "gringo", "griots", "griped", "griper",
  "gripes", "gripey", "grippe", "grippy", "grisly", "grison", "grists", "griths", "gritty", "grivet",
  "groans", "groats", "grocer", "groggy", "groins", "grooms", "groove", "groovy", "groped", "groper",
  "gropes", "grosze", "groszy", "grotto", "grotty", "grouch", "ground", "groups", "grouse", "grouts",
  "grouty", "groved", "grovel", "groves", "grower", "growls", "growly", "growth", "groyne", "grubby",
  "grudge", "gruels", "gruffs", "gruffy", "grugru", "grumes", "grumps", "grumpy", "grunge", "grungy",
  "grunts", "grutch", "guacos", "guaiac", "guanay", "guanin", "guanos", "guards", "guavas", "guenon",
  "guests", "guffaw", "guggle", "guglet", "guided", "guider", "guides", "guidon", "guilds", "guiled",
  "guiles", "guilts", "guilty", "guimpe", "guinea", "guiros", "guised", "guises", "guitar", "gulags",
  "gulden", "gulfed", "gulled", "gullet", "gulley", "gulped", "gulper", "gumbos", "gummas", "gummed",
  "gummer", "gundog", "gunite", "gunman", "gunmen", "gunned", "gunnel", "gunnen", "gunner", "gunsel",
  "gurged", "gurges", "gurgle", "gurnet", "gurney", "gushed", "gusher", "gushes", "gusset", "gussie",
  "gusted", "guttae", "gutted", "gutter", "guttle", "guying", "guyots", "guzzle", "gweduc", "gybing",
  "gypped", "gypper", "gypsum", "gyrase", "gyrate", "gyrene", "gyring", "gyrons", "gyrose", "gyving",

  // H words
  "habile", "habits", "haboob", "haceks", "hacked", "hackee", "hacker", "hackie", "hackle", "hackly",
  "hading", "hadith", "hadjee", "hadjes", "hadjis", "hadron", "haeing", "haemal", "haemic", "haemin",
  "haeres", "haffet", "haffit", "hafted", "hafter", "hagbut", "hagdon", "hagged", "haggis", "haggle",
  "haikus", "hailed", "hailer", "hairdo", "haired", "hajjes", "hajjis", "hakeem", "hakims", "halala",
  "halers", "haleru", "halest", "halide", "halids", "haling", "halite", "hallah", "hallel", "halloa",
  "halloo", "hallos", "hallot", "hallow", "hallux", "halmas", "haloed", "haloes", "haloid", "halted",
  "halter", "halutz", "halvah", "halvas", "halved", "halves", "hamada", "hamals", "hamate", "hamaul",
  "hamlet", "hammal", "hammed", "hammer", "hamper", "hamuli", "hamzah", "hamzas", "hances", "handed",
  "handle", "hangar", "hanged", "hanger", "hangul", "hangup", "haniwa", "hanked", "hanker", "hankie",
  "hansas", "hansel", "hanses", "hansom", "hanted", "hantle", "haoles", "happed", "happen", "hapten",
  "haptic", "harass", "harbor", "harden", "harder", "hardly", "hareem", "harems", "haring", "harked",
  "harken", "harlot", "harmed", "harmer", "harmin", "harped", "harper", "harpin", "harrow", "hartal",
  "hashed", "hashes", "haslet", "hasped", "hassel", "hassle", "hasted", "hasten", "hastes", "hatbox",
  "haters", "hatful", "hating", "hatpin", "hatred", "hatted", "hatter", "haughs", "hauled", "hauler",
  "haulms", "haulmy", "haunch", "haunts", "hausen", "havens", "havers", "having", "havior", "havocs",
  "hawing", "hawked", "hawker", "hawkey", "hawkie", "hawser", "hawses", "hayers", "haying", "haymow",
  "hazans", "hazard", "hazels", "hazers", "hazier", "hazily", "hazing", "hazzan", "headed", "header",
  "healed", "healer", "health", "heaped", "hearer", "hearse", "hearth", "hearts", "hearty", "heated",
  "heater", "heaths", "heathy", "heaume", "heaved", "heaven", "heaver", "heaves", "heckle", "hectic",
  "hector", "heddle", "heders", "hedged", "hedger", "hedges", "heeded", "heeder", "heehaw", "heeled",
  "heeler", "heezed", "heezes", "hefted", "hefter", "hegari", "hegira", "heifer", "height", "heiled",
  "heinie", "heired", "heishi", "heists", "hejira", "heliac", "helios", "helium", "helled", "heller",
  "hellos", "helmed", "helmet", "helots", "helped", "helper", "helved", "helves", "hemins", "hemmed",
  "hemmer", "hemoid", "hempen", "hempie", "henbit", "hennas", "henrys", "hented", "hepcat", "heptad",
  "herald", "herbal", "herbed", "herded", "herder", "herdic", "hereat", "hereby", "herein", "hereof",
  "hereon", "heresy", "hereto", "heriot", "hermae", "hermai", "hermit", "hernia", "heroes", "heroic",
  "heroin", "herons", "herpes", "hetero", "hetman", "heuchs", "heughs", "hewers", "hewing", "hexade",
  "hexads", "hexane", "hexers", "hexing", "hexone", "hexose", "hexyls", "heyday", "heydey", "hiatal",
  "hiatus", "hiccup", "hickey", "hidden", "hiders", "hiding", "hieing", "hiemal", "higgle", "higher",
  "highly", "highth", "hights", "hijack", "hikers", "hiking", "hilled", "hiller", "hilloa", "hillos",
  "hilted", "hinder", "hinged", "hinger", "hinges", "hinted", "hinter", "hipped", "hipper", "hippie",
  "hippos", "hirers", "hiring", "hirple", "hirsel", "hirsle", "hispid", "hissed", "hisser", "hisses",
  "histed", "hither", "hitter", "hiving", "hoagie", "hoards", "hoarse", "hoaxed", "hoaxer", "hoaxes",
  "hobbed", "hobbit", "hobble", "hobnob", "hoboed", "hoboes", "hocked", "hocker", "hockey", "hodads",
  "hodden", "hoddin", "hoeing", "hogans", "hogged", "hogger", "hogget", "hognut", "hogtie", "hoicks",
  "hoiden", "hoised", "hoises", "hoists", "hokier", "hokily", "hoking", "hokums", "holard", "holden",
  "holder", "holdup", "holier", "holies", "holily", "holing", "holism", "holist", "holked", "hollas",
  "holler", "holloa", "holloo", "hollos", "hollow", "holmic", "holpen", "homage", "hombre", "homely",
  "homers", "homier", "homily", "homing", "hominy", "hommos", "honans", "honcho", "hondas", "hondle",
  "honers", "honest", "honeys", "honied", "honing", "honked", "honker", "honkey", "honkie", "honors",
  "honour", "hooded", "hoodie", "hoodoo", "hooeys", "hoofed", "hoofer", "hookah", "hookas", "hooked",
  "hooker", "hookey", "hookup", "hoolie", "hooped", "hooper", "hoopla", "hoopoe", "hoopoo", "hoorah",
  "hooray", "hootch", "hooted", "hooter", "hooved", "hooves", "hopers", "hoping", "hopped", "hopper",
  "hopple", "horahs", "horary", "horded", "hordes", "horned", "hornet", "horrid", "horror", "horsed",
  "horses", "horsey", "horste", "horsts", "hosels", "hosier", "hosing", "hostas", "hosted", "hostel",
  "hostly", "hotbed", "hotbox", "hotdog", "hotels", "hotrod", "hotted", "hotter", "houdah", "hounds",
  "houris", "hourly", "housed", "housel", "houser", "houses", "hovels", "hovers", "howdah", "howdie",
  "howffs", "howked", "howled", "howler", "howlet", "hoyden", "hoyles", "hubbly", "hubbub", "hubcap",
  "hubris", "huckle", "huddle", "huffed", "hugely", "hugest", "hugged", "hugger", "huipil", "hulked",
  "hulled", "huller", "hulloa", "hullos", "humane", "humans", "humate", "humble", "humbly", "humbug",
  "humeri", "hummed", "hummer", "hummus", "humors", "humour", "humped", "humphs", "humvee", "hunger",
  "hungry", "hunker", "hunted", "hunter", "hurdle", "hurled", "hurler", "hurley", "hurrah", "hurray",
  "hursts", "hurter", "hurtle", "hushed", "hushes", "husked", "husker", "huskie", "hussar", "hustle",
  "hutted", "hutzpa", "huzzah", "huzzas", "hyaena", "hyalin", "hybrid", "hybris", "hydrae", "hydras",
  "hydria", "hydric", "hydrid", "hydros", "hyenas", "hyenic", "hyetal", "hymens", "hymnal", "hymned",
  "hyoids", "hyphae", "hyphal", "hyphen", "hyping", "hypnic", "hypoed", "hysons", "hyssop",

  // I words
  "iambic", "iambus", "iatric", "ibexes", "ibices", "ibidem", "ibises", "icebox", "icecap", "iceman",
  "icemen", "ichors", "icicle", "iciest", "icings", "ickers", "ickier", "ickily", "icones", "iconic",
  "ideals", "ideate", "idiocy", "idioms", "idiots", "idlers", "idlest", "idling", "idylls", "iffier",
  "igloos", "ignify", "ignite", "ignore", "iguana", "ihrams", "ilexes", "iliads", "illest", "illite",
  "illume", "imaged", "imager", "images", "imagos", "imaret", "imaums", "imbalm", "imbark", "imbeds",
  "imbibe", "imbody", "imbrue", "imbued", "imbues", "imides", "imidic", "imines", "immane", "immesh",
  "immies", "immune", "immure", "impact", "impair", "impala", "impale", "impark", "impart", "impawn",
  "impede", "impels", "impend", "imphee", "imping", "impish", "impone", "import", "impose", "impost",
  "improv", "impugn", "impure", "impute", "inaner", "inanes", "inarch", "inarms", "inborn", "inbred",
  "incage", "incant", "incase", "incept", "incest", "inched", "inches", "incise", "incite", "inclip",
  "incogs", "income", "incony", "incubi", "incult", "incurs", "incuse", "indaba", "indeed", "indene",
  "indent", "indict", "indies", "indign", "indigo", "indite", "indium", "indole", "indols", "indoor",
  "indows", "indris", "induce", "induct", "indued", "indues", "indult", "inerts", "infall", "infamy",
  "infant", "infare", "infect", "infers", "infest", "infirm", "inflow", "influx", "infold", "inform",
  "infuse", "ingate", "ingest", "ingles", "ingots", "ingulf", "inhale", "inhaul", "inhere", "inhume",
  "inions", "inject", "injure", "injury", "inkers", "inkier", "inking", "inkjet", "inkles", "inkpot",
  "inlace", "inlaid", "inland", "inlays", "inlets", "inlier", "inmate", "inmesh", "inmost", "innate",
  "inners", "inning", "inpour", "inputs", "inroad", "inrush", "insane", "inseam", "insect", "insert",
  "insets", "inside", "insist", "insole", "insoul", "inspan", "instal", "instar", "instep", "instil",
  "insult", "insure", "intact", "intake", "intend", "intent", "intern", "inters", "intima", "intime",
  "intine", "intomb", "intone", "intort", "intown", "intron", "intros", "intuit", "inturn", "inulin",
  "inured", "inures", "inurns", "invade", "invars", "invent", "invert", "invest", "invite", "invoke",
  "inwall", "inward", "inwind", "inwove", "inwrap", "iodate", "iodide", "iodids", "iodine", "iodins",
  "iodise", "iodism", "iodize", "iodous", "iolite", "ionics", "ionise", "ionium", "ionize", "ionone",
  "ipecac", "irades", "irater", "ireful", "irenic", "irides", "iridic", "irised", "irises", "iritic",
  "iritis", "irking", "irokos", "ironed", "ironer", "irones", "ironic", "irreal", "irrupt", "isatin",
  "ischia", "island", "islets", "isling", "isobar", "isogon", "isohel", "isolog", "isomer", "isopod",
  "isseis", "issued", "issuer", "issues", "isthmi", "istles", "italic", "itched", "itches", "itemed",
  "iterum", "itself", "ixodid", "ixoras", "ixtles", "izzard",

  // J words
  "jabbed", "jabber", "jabiru", "jabots", "jacals", "jacana", "jackal", "jacked", "jacker", "jacket",
  "jading", "jadish", "jaeger", "jagers", "jagged", "jagger", "jagras", "jaguar", "jailed", "jailer",
  "jailor", "jalaps", "jalops", "jalopy", "jambed", "jambes", "jammed", "jammer", "jangle", "jangly",
  "japans", "japers", "japery", "japing", "jarful", "jargon", "jarina", "jarrah", "jarred", "jarvey",
  "jasmin", "jasper", "jassid", "jauked", "jaunce", "jaunts", "jaunty", "jauped", "jawans", "jawing",
  "jaygee", "jayvee", "jazzed", "jazzer", "jazzes", "jebels", "jeeing", "jeeped", "jeered", "jeerer",
  "jehads", "jejuna", "jejune", "jelled", "jennet", "jerboa", "jereed", "jerids", "jerked", "jerker",
  "jerkin", "jerrid", "jersey", "jessed", "jesses", "jested", "jester", "jesuit", "jetons", "jetsam",
  "jetsom", "jetted", "jetton", "jewels", "jewing", "jezail", "jibbed", "jibber", "jibers", "jibing",
  "jicama", "jigged", "jigger", "jiggle", "jiggly", "jigsaw", "jihads", "jilted", "jilter", "jiminy",
  "jimper", "jimply", "jingal", "jingko", "jingle", "jingly", "jinked", "jinker", "jinnee", "jinxed",
  "jinxes", "jitney", "jitter", "jivers", "jivier", "jiving", "jnanas", "jobbed", "jobber", "jockey",
  "jockos", "jocose", "jocund", "jogged", "jogger", "joggle", "johnny", "joined", "joiner", "joints",
  "joists", "jojoba", "jokers", "jokier", "jokily", "joking", "jolted", "jolter", "jorams", "jordan",
  "jorums", "joseph", "joshed", "josher", "joshes", "josses", "jostle", "jotted", "jotter", "jouals",
  "jouked", "joules", "jounce", "jouncy", "jousts", "jovial", "jowars", "jowing", "jowled", "joyful",
  "joying", "joyous", "joypop", "jubbah", "jubhah", "jubile", "judder", "judged", "judger", "judges",
  "judoka", "jugate", "jugful", "jugged", "juggle", "jugula", "jugums", "juiced", "juicer", "juices",
  "jujube", "juking", "juleps", "jumbal", "jumble", "jumbos", "jumped", "jumper", "juncos", "jungle",
  "jungly", "junior", "junked", "junker", "junket", "junkie", "juntas", "juntos", "jupons", "jurant",
  "jurats", "jurels", "juried", "juries", "jurist", "jurors", "justed", "juster", "justle", "justly",
  "jutted",

];

// Add these words to the dictionary
addWordsToDict(wordsFtoJ); 
