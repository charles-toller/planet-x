import {createSvgIcon, SvgIcon, SvgIconProps} from "@mui/material";
import React from "react";
function createSvgIconLocal(viewBox: string, ...args: Parameters<typeof createSvgIcon>) {
    const Component = createSvgIcon(...args);
    return (props: Partial<SvgIconProps>) => (
        <Component viewBox={viewBox} {...props} />
    );
}

export const TheoryIcon = createSvgIconLocal(
    "-1.25 0 11.500555 11.500555",
    <path
        d="M 5.81731,0 H 0 V 11.500555 H 9.05228 V 3.234972 Z M 6.02192,1.622778 7.43303,3.033889 H 6.02192 Z M 1.00189,10.495139 V 1.005417 h 4.15925 v 2.875138 h 2.88925 v 6.614584 z M 4.12045,3.305528 H 2.08139 V 2.599972 H 4.12045 Z M 6.97089,5.319889 H 2.08139 V 4.614333 h 4.8895 z m 0,2.014361 H 2.08139 V 6.628694 h 4.8895 z m 0,2.014361 H 2.08139 V 8.643056 h 4.8895 z"
        style={{fillOpacity: 1, fillRule: "nonzero", stroke: "none", strokeWidth: 0.352778}}
        id="path1159"/>,
    "Theory"
);

export const AsteroidIcon = createSvgIconLocal(
    "0 -0.4 5.0000124 5",
    <path
        d="m 0.518156,0.27091 c -0.10548055,0 -0.18203333,0.0673806 -0.19720277,0.10371666 C 0.26556712,0.50585999 0.25075045,0.7771461 0.29731712,0.80713221 0.492756,0.83676554 0.82824766,0.65684888 0.85329488,0.56265722 0.88257544,0.451885 0.75310599,0.34040722 0.610231,0.28819611 V 0.28784333 C 0.57777544,0.27620167 0.54708378,0.27091 0.518156,0.27091 M 0.33612267,1.0801822 0.26133378,1.0748905 C 0.17349212,1.0618378 0.10046712,1.010685 0.05566434,0.93060443 -0.05722454,0.7295211 0.02955879,0.37039333 0.0722449,0.26949889 0.14385879,0.10016556 0.40279767,-0.07622333 0.70336433,0.03454889 1.0085171,0.14673222 1.1771449,0.39261833 1.1139977,0.63144888 1.0512032,0.86992665 0.62681155,1.0801822 0.33612267,1.0801822 M 1.9843004,2.4514294 c -0.035983,0 -0.051153,0.015875 -0.057503,0.022225 -0.044097,0.046214 -0.050094,0.1569861 -0.014111,0.2525889 0.017992,0.047272 0.072672,0.1576916 0.1940278,0.168275 0.062794,0.00529 0.2109611,0.00741 0.2293055,-0.084314 C 2.3578921,2.7033127 2.2319504,2.5241016 2.0435671,2.4623655 l -0.059267,-0.010936 m 0.1735667,0.6251222 -0.066675,-0.00318 C 1.9366754,3.0603238 1.8068532,2.9541377 1.7447643,2.7900961 1.6819699,2.6246433 1.7027838,2.4475488 1.7966226,2.3494766 1.8393087,2.3046738 1.9352643,2.2376461 2.099306,2.2912683 2.3621254,2.3769933 2.5550948,2.6362849 2.5124087,2.8461877 2.5011198,2.9026322 2.442206,3.0765516 2.1578671,3.0765516 M 3.2553587,1.067835 c -0.013053,0 -0.081139,0.02928 -0.1710972,0.1213555 -0.1199444,0.1224139 -0.1993194,0.27305 -0.1929694,0.3658306 0.00423,0.062794 0.059619,0.092075 0.1051277,0.1054805 0.111125,0.032456 0.2504723,-3.527e-4 0.3037417,-0.071967 C 3.3537835,1.5165676 3.3657785,1.359229 3.3283835,1.2142374 3.3036893,1.1179294 3.2677059,1.0731266 3.2553587,1.067835 M 3.0884948,1.8527655 c -0.050447,0 -0.099483,-0.0067 -0.142875,-0.019403 C 2.8076837,1.7924405 2.7201948,1.6929572 2.7113754,1.5670155 2.6979698,1.366285 2.8740059,1.1158128 3.0465143,0.98140443 3.1491726,0.90132387 3.2384254,0.87274888 3.3118032,0.89673776 3.4091698,0.92848776 3.4631448,1.0403183 3.4910143,1.1285128 3.545342,1.2992572 3.5538087,1.5497294 3.4444476,1.6961322 3.3629559,1.8058461 3.2207865,1.8527655 3.0884948,1.8527655 m 0.2226028,0.43815 c -0.077258,0 -0.1502833,0.041275 -0.1954389,0.1104195 -0.039158,0.059972 -0.049036,0.1287638 -0.026105,0.1806222 0.060325,0.1361722 0.3118555,0.3167944 0.4561416,0.327025 0.095603,0.0067 0.2099028,-0.01905 0.2518833,-0.2804584 C 3.8063976,2.5756072 3.7901698,2.5262183 3.748542,2.4771822 3.650117,2.3621766 3.4451532,2.2909155 3.3110976,2.2909155 M 3.5658032,3.0896044 3.532642,3.0881933 C 3.319917,3.0733766 3.0133532,2.8543016 2.9248059,2.6546294 2.8771809,2.5463266 2.8919976,2.4150933 2.9650226,2.3032627 3.0433393,2.1829655 3.1728087,2.1109988 3.3110976,2.1109988 c 0.1753306,0 0.4360333,0.087489 0.5743222,0.2494139 0.075847,0.089253 0.1068917,0.1915584 0.089958,0.2966861 C 3.9164643,3.0250461 3.7062087,3.0896044 3.5658032,3.0896044 M 2.2968615,0.37886 c -0.2271889,0 -0.5443361,0.11288888 -0.5725583,0.18379722 C 1.7091338,0.75068777 1.6459865,0.94400999 1.5380365,1.1330989 1.4854726,1.2255266 1.369056,1.302785 1.2342949,1.3920378 1.1602115,1.4410739 1.0360338,1.5236239 1.0131032,1.5603127 0.90832821,1.75681 0.80955044,2.0411488 0.87798933,2.1935488 c 0.0391583,0.087489 0.11712222,0.1315862 0.20743337,0.1827389 0.1051277,0.05962 0.2240138,0.1266473 0.2719916,0.2705806 0.025753,0.076906 0.036689,0.1562805 0.047625,0.2331861 0.017286,0.1273528 0.032808,0.2370666 0.104775,0.3171472 0.123825,0.1379361 0.7609417,0.6942667 1.3924139,0.6942667 0.3118555,0 0.3266722,-0.047978 0.34925,-0.1195917 C 3.2779362,3.6875626 3.3178002,3.5602099 3.4871337,3.4706044 3.6360059,3.3919344 3.7457198,3.3658294 3.8339143,3.3453683 3.9344559,3.3213793 4.0007781,3.3062103 4.110492,3.2158988 4.193748,3.1474598 4.2202059,3.0931322 4.2508976,3.0299849 4.2971116,2.9350879 4.3546142,2.8165544 4.5666337,2.7202461 c 0.0127,-0.0067 0.05715,-0.062442 0.088194,-0.2197806 0.073378,-0.3735917 3.528e-4,-0.8787694 -0.065264,-0.9584972 -0.046214,-0.055739 -0.073025,-0.056797 -0.1524,-0.058914 C 4.3521448,1.4802322 4.2353754,1.4763516 4.1179004,1.3775739 4.0304115,1.3038433 3.9651476,1.163085 3.8829504,0.98493221 3.7869948,0.77820443 3.6423559,0.46564333 3.5026559,0.43706833 3.3626032,0.40849333 3.2645309,0.45400166 3.1611671,0.50162666 3.0578032,0.55030999 2.9406809,0.60463777 2.7995698,0.56653777 2.7082004,0.54149055 2.6302365,0.50127388 2.5614448,0.46599611 2.4669004,0.41731277 2.3921115,0.37886 2.2968615,0.37886 M 2.9022282,4.206146 C 2.1606893,4.206146 1.4618365,3.6148905 1.2755699,3.4081627 1.1390449,3.2564683 1.1132921,3.0716127 1.092831,2.9234461 1.0840115,2.8578294 1.0751921,2.7957405 1.0589643,2.7467044 1.0490865,2.7174238 0.99158377,2.6849683 0.93055321,2.6503961 0.82154488,2.5886599 0.67231989,2.5043461 0.59047544,2.3223127 0.45500878,2.0199822 0.62328378,1.6216961 0.73581988,1.4110878 0.79050044,1.3084294 0.92173377,1.2216461 1.0603754,1.1299239 1.1288143,1.0844155 1.2431143,1.0082155 1.2653393,0.97575998 1.3496532,0.8279461 1.3990421,0.6787211 1.4110365,0.53302388 1.4410226,0.17530722 2.070731,0.06382945 2.2968615,0.06382945 c 0.17145,0 0.2973917,0.06491111 0.4085167,0.12206111 0.060325,0.0310444 0.117475,0.060325 0.1770944,0.0769056 0.029281,0.008114 0.083256,-0.0172861 0.1456972,-0.0462139 0.1248834,-0.0582083 0.2956278,-0.1379361 0.5379861,-0.0878417 0.2956278,0.0606778 0.4656667,0.42862499 0.6025445,0.72389998 0.049389,0.10724444 0.117475,0.25399996 0.1520472,0.28398606 0.031044,0.026106 0.056444,0.029281 0.1266472,0.031397 0.098778,0.00318 0.2483556,0.00776 0.3848805,0.1732139 C 5.0033726,1.5486711 5.0428837,2.2214183 4.9539837,2.6066516 4.9056531,2.8169072 4.8188698,2.9516683 4.6968087,3.0070544 4.5885059,3.0564433 4.5712198,3.0913683 4.5341781,3.167921 4.4971365,3.2437683 4.447042,3.3471322 4.310517,3.4593155 4.1440059,3.5958405 4.0230031,3.6244155 3.9062337,3.6519321 3.8247417,3.6709821 3.7474837,3.6889741 3.634242,3.7489461 3.579562,3.7778741 3.5718,3.8022151 3.552045,3.8657156 3.4825476,4.0865544 3.3587226,4.206146 2.9022282,4.206146"
        style={{fillOpacity: 1, fillRule: "nonzero", stroke: "none", strokeWidth: 0.352778}}
        id="path445" />,
    "Asteroid"
);

export const CometIcon = createSvgIconLocal(
    "0 0 4.9999633 5.0009775",
    <path
        d="m 1.382227,3.11573 c -0.1287639,0 -0.257175,0.049389 -0.3552472,0.1471083 -0.19579168,0.1957917 -0.19579168,0.5147028 0,0.7104945 0.1957916,0.1957916 0.5147028,0.1957916 0.7104944,0 0.1957917,-0.1957917 0.1957917,-0.5147028 0,-0.7104945 C 1.639402,3.1651189 1.5106381,3.11573 1.382227,3.11573 m 0,1.2195528 c -0.1837972,0 -0.3675944,-0.06985 -0.50729443,-0.2099028 -0.28010555,-0.2797528 -0.28010555,-0.7351889 0,-1.0149417 0.27940003,-0.2797527 0.73483613,-0.2797527 1.01458883,0 0.2797528,0.2797528 0.2797528,0.7351889 0,1.0149417 -0.1397,0.1400528 -0.3234972,0.2099028 -0.5072944,0.2099028 M 1.8687075,1.842555 0.77721312,2.6990995 C 0.7299409,2.7326133 0.69995479,2.7629522 0.65832702,2.80458 l -0.0179917,0.017992 c -0.4236861,0.4236861 -0.4236861,1.1130138 0,1.5370527 0.42403888,0.4240389 1.11371948,0.4240389 1.53740558,0 0.048331,-0.048331 0.091722,-0.091369 0.123825,-0.1361722 L 2.3008603,4.2230994 3.1577575,3.131605 C 3.1090742,3.1005606 3.0628603,3.0582272 3.0293464,3.0000189 2.957027,2.8733717 2.9672575,2.7185022 3.0596853,2.5399967 l 0.00564,-0.00988 L 4.0160658,0.98389394 2.4599631,1.9402745 C 2.2818103,2.033055 2.1269409,2.0432856 2.0002937,1.9709661 1.9417325,1.9374522 1.8993992,1.8912384 1.8687075,1.842555 M 1.4090381,5.0009744 c -0.3764139,0 -0.73060275,-0.1467555 -0.99694997,-0.4131028 -0.54962776,-0.5496277 -0.54927499,-1.4439194 0,-1.9938999 l 0.0172861,-0.016933 c 0.0472722,-0.047272 0.0917222,-0.092075 0.155575,-0.1368777 L 2.0937798,1.2555328 2.1100075,1.5659773 c 0.00282,0.041275 0.023636,0.1097138 0.0508,0.1248833 0.017286,0.00953 0.065969,0.00635 0.1456973,-0.034572 L 4.999963,-3.26464e-6 3.3436714,2.6941606 c -0.040922,0.079728 -0.043744,0.1284111 -0.034219,0.1456972 0.016228,0.027869 0.089958,0.048331 0.1248833,0.050447 l 0.310444,0.016228 -1.1768666,1.4993055 C 2.5195825,4.47463 2.4631381,4.5307216 2.4088103,4.5850494 2.1396409,4.8542189 1.7858048,5.0009744 1.4090381,5.0009744"
        style={{fillOpacity: 1, fillRule: "nonzero", stroke: "none", strokeWidth: 0.352778}}
        id="path437" />,
    "Comet"
);

export const DwarfPlanetIcon = createSvgIconLocal(
    "0 0 4.9999194 5.0002723",
    <path
        d="m 4.131028,2.79823 c -0.508,0.1397 -1.0569222,0.2113139 -1.6308916,0.2113139 -0.1661584,0 -0.333375,-0.00635 -0.4967111,-0.01905 l 0.010936,-0.1481667 c 0.1598083,0.011994 0.3231444,0.018344 0.485775,0.018344 0.5605638,0 1.0960805,-0.069497 1.5913805,-0.2056695 z M 2.5001364,4.6531355 c -0.8551333,0 -1.59561388,-0.50165 -1.94239443,-1.2262555 C 1.0526892,3.5993883 1.6245419,3.7034578 2.2115642,3.7288578 l 0.00635,-0.1488723 C 1.6425336,3.5552911 1.0830281,3.4526328 0.6000753,3.2843578 0.55844752,3.2698939 0.51823086,3.2540189 0.47801419,3.2384967 0.40710586,3.0448217 0.36336142,2.8387994 0.35136697,2.6239578 c 0.0652639,0.026458 0.13158611,0.051506 0.19967222,0.075847 0.36688888,0.1277056 0.76835001,0.2173111 1.19380001,0.2667 L 1.7621253,2.8186911 C 1.3472586,2.7707133 0.95638085,2.6835772 0.6000753,2.5586939 0.51329197,2.528355 0.43003641,2.4958995 0.34819197,2.4613272 c 0.003528,-0.1774472 0.0275167,-0.34925 0.0712611,-0.5136444 0.0433917,0.017286 0.0871361,0.033161 0.13158611,0.048683 C 1.1317114,2.1992133 1.8058697,2.306105 2.5001364,2.306105 V 2.1572328 c -0.6776861,0 -1.3349111,-0.1037167 -1.9000611,-0.3012722 -0.0465667,-0.016581 -0.092075,-0.033161 -0.13687777,-0.050447 0.0328083,-0.096661 0.0723194,-0.1894417 0.11782777,-0.2786945 0.5739694,0.1957917 1.2364861,0.2995083 1.9191111,0.2995083 0.6850944,0 1.3444361,-0.1044222 1.9184055,-0.3002138 0.045861,0.0889 0.085372,0.1827388 0.1181805,0.2790472 l -0.037747,0.014817 c -0.248003,0.093486 -0.5175252,0.16898 -0.8015113,0.2240133 l 0.028928,0.1464028 c 0.291747,-0.05715 0.5693831,-0.1344083 0.825147,-0.2307167 l 0.028928,-0.011994 c 0.046919,0.1763889 0.072319,0.3612444 0.072319,0.5520972 0,0.2599972 -0.046214,0.5090583 -0.1308805,0.7394222 l -0.022931,0.00953 -0.047978,0.016581 c -0.048683,0.017992 -0.097719,0.03563 -0.1481666,0.051858 L 4.215341,3.3432776 C 4.17583,3.3552716 4.137024,3.3672666 4.0968077,3.3789086 l -0.093839,0.023989 C 3.9631058,3.4131217 3.9232419,3.4229994 3.8826724,3.4325244 3.851628,3.43958 3.819878,3.4462828 3.788128,3.4533383 3.4346447,3.52848 3.0596419,3.5736355 2.6751141,3.5838661 l 0.00388,0.1485194 C 3.038828,3.7225078 3.391253,3.6837022 3.7263919,3.6177328 v 0.00106 c 0.03175,-0.00635 0.063147,-0.013758 0.094544,-0.020108 0.032103,-0.00741 0.064558,-0.013758 0.096308,-0.021167 0.042333,-0.00953 0.083608,-0.020461 0.1252361,-0.031397 0.03175,-0.00811 0.0635,-0.015522 0.094897,-0.023989 0.041628,-0.011642 0.08255,-0.024695 0.1234722,-0.037395 L 4.3493974,3.45863 c 0.03175,-0.010583 0.062442,-0.021872 0.093839,-0.032808 -0.3467806,0.724958 -1.0872612,1.2273135 -1.9431,1.2273135 m 0,-4.30565267 c 0.7824611,0 1.4689666,0.41980555 1.8453805,1.04633887 C 3.7927141,1.5793828 3.1591252,1.677455 2.5001364,1.677455 1.8436169,1.677455 1.2072058,1.5793828 0.65440308,1.3938217 0.70343919,1.3119773 0.75811974,1.2340134 0.81738641,1.1595773 1.0724447,1.232955 1.3416142,1.2890467 1.6224253,1.3267939 L 1.6421808,1.1796856 C 1.3931197,1.1458189 1.1539364,1.0967828 0.92568918,1.0343412 1.3186836,0.61206616 1.8788947,0.34748283 2.5001364,0.34748283 m 0,-0.34748610164 C 1.1214808,-3.27164e-6 3.133e-7,1.12183 3.133e-7,2.49978 c 0,1.3790083 1.1214804867,2.5004888 2.5001360867,2.5004888 1.3786555,0 2.4997832,-1.1214805 2.4997832,-2.5004888 0,-1.37795 -1.1211277,-2.49978327164 -2.4997832,-2.49978327164"
        style={{fillOpacity: 1, fillRule: "nonzero", stroke: "none", strokeWidth: 0.352778}}
        id="path453"/>,
    "DwarfPlanet"
);

export const GasCloudIcon = createSvgIconLocal(
    "0 -0.75 4.9999194 5",
    <path
        d="M 2.124075,2.53365 1.8263306,2.3681972 C 1.6862778,2.6204333 1.4206361,2.7767139 1.1327695,2.7767139 c -0.43673891,0 -0.79233891,-0.3552472 -0.79233891,-0.7923389 0,-0.4078111 0.30338889,-0.7464777 0.70590831,-0.7874 L 1.1835695,1.183217 1.1983865,1.0459864 c 0.043745,-0.40216661 0.3799417,-0.7055555 0.7824611,-0.7055555 0.1954389,0 0.3838222,0.0726722 0.5298722,0.20496389 l 0.094545,0.0850194 0.1083028,-0.0659694 C 2.8388028,0.48789171 2.981325,0.44767505 3.1259639,0.44767505 c 0.2183694,0 0.4215694,0.0871361 0.5722055,0.24518055 l 0.2469444,-0.23495 C 3.7292139,0.23177505 3.438525,0.10689172 3.1259639,0.10689172 2.9591,0.10689172 2.7947055,0.14463894 2.6440694,0.21554727 2.4514528,0.07584728 2.2200306,5.5860001e-8 1.9808472,5.5860001e-8 1.4481528,5.5860001e-8 0.99695002,0.36971116 0.88159169,0.87912226 0.37076948,0.99201115 4.683e-8,1.4456834 4.683e-8,1.984375 4.683e-8,2.6094972 0.50800004,3.1174972 1.1327695,3.1174972 1.5441083,3.1174972 1.92405,2.8938361 2.124075,2.53365 M 3.14325,3.6089166 c -0.2120195,0 -0.4212167,-0.061031 -0.6007806,-0.1732138 -0.3213805,0.2014361 -0.7397749,0.2268361 -1.0816166,0.065969 l 0.1446389,-0.307975 c 0.1054805,0.049389 0.2183694,0.074436 0.3361972,0.074436 0.1813278,0 0.3520722,-0.059972 0.4945944,-0.1739194 l 0.1061861,-0.08502 0.1065389,0.085372 C 2.7911778,3.2081598 2.9619222,3.268132 3.14325,3.268132 c 0.2871611,0 0.542925,-0.1531055 0.6840361,-0.409575 l 0.043039,-0.078317 0.0889,-0.00917 C 4.3582166,2.7308528 4.6594888,2.3925389 4.6594888,1.984375 4.6594888,1.6368889 4.4368861,1.3335 4.1059805,1.2290778 4.029075,1.2043834 3.9486416,1.1920361 3.8667972,1.1920361 c -0.263525,0 -0.5090583,0.1305278 -0.6568722,0.34925 L 2.92735,1.3507861 C 3.1386639,1.038225 3.4900305,0.85160559 3.8667972,0.85160559 c 0.1167694,0 0.231775,0.0176389 0.3418416,0.0525639 0.473075,0.14957781 0.7912806,0.58349441 0.7912806,1.08020551 0,0.5538611 -0.3894667,1.0174111 -0.9193389,1.1133667 C 3.8720889,3.419475 3.5277777,3.6089166 3.14325,3.6089166"
        style={{fillOpacity: 1, fillRule: "nonzero", stroke: "none", strokeWidth: 0.352778}}
        id="path441" />,
    "GasCloud"
);

export const PlanetXIcon = createSvgIconLocal(
    "0 0 4.9999194 5.0002723",
    <path
        d="M 3.147836,3.60045 1.5924388,1.3521973 H 1.8707805 L 3.4261777,3.60045 Z m 0.5259917,0 -0.8688917,-1.2558889 0.00776,0.006 L 3.4896766,1.3522 h 0.2921 L 3.7747221,1.1454695 H 2.836686 l 0.00706,0.2067278 H 3.2321499 L 2.6832277,2.1688778 2.1184305,1.3521973 h 0.2942166 l -0.00741,-0.2067278 h -1.323975 l 0.00741,0.2067278 h 0.2564694 l 0.8509,1.2301361 L 1.5091833,3.60045 H 1.1669888 l 0.00706,0.2067278 h 0.98354 L 2.1505332,3.60045 H 1.7691805 L 2.3226888,2.765425 2.9005388,3.60045 H 2.6613555 l 0.00706,0.2067278 H 3.8678554 L 3.8604471,3.60045 Z M 2.500136,4.6898278 c -1.2075583,0 -2.1896916,-0.9821334 -2.1896916,-2.1900444 0,-1.2072056 0.9821333,-2.18933888 2.1896916,-2.18933888 1.2072055,0 2.1896916,0.98213328 2.1896916,2.18933888 0,1.207911 -0.9824861,2.1900444 -2.1896916,2.1900444 m 0,-4.689827720620002 C 1.1214805,7.938e-8 -4.1709999e-8,1.1218334 -4.1709999e-8,2.4997834 -4.1709999e-8,3.8787917 1.1214805,5.0002722 2.500136,5.0002722 c 1.3786555,0 2.4997833,-1.1214805 2.4997833,-2.5004888 C 4.9999193,1.1218334 3.8787915,7.938e-8 2.500136,7.938e-8"
        style={{fillOpacity: 1, fillRule: "nonzero", stroke: "none", strokeWidth: 0.352778}}
        id="path449" />,
    "PlanetX"
);

export const EmptySectorIcon = createSvgIconLocal(
    "0 0 4.5000334 4.4996805",
    <path
        d="M 1.4647333,4.1091555 H 0.39087777 V 2.9735639 H 0 V 4.4996805 H 1.4647333 Z M 4.5000332,2.9735639 H 4.1095082 V 4.1091555 H 2.9880277 v 0.390525 h 1.5120055 z m 0,-2.97356386496 H 2.9880277 V 0.3908778 h 1.1214805 v 1.0593916 h 0.390525 z M 0.39087777,1.4502694 H 0 V 3.504e-8 H 1.4647333 V 0.3908778 H 0.39087777"
        style={{fillOpacity: 1, fillRule: "nonzero", stroke: "none", strokeWidth: 0.352778}}
        id="path433" />,
    "EmptySector"
);

export const TargetIcon = createSvgIconLocal(
    "0 0 9.2540665 9.2537136",
    <path
        d="m 4.62703,6.1468 c -0.83926,0 -1.51977,-0.680508 -1.51977,-1.519767 0,-0.839611 0.68051,-1.520119 1.51977,-1.520119 0.83926,0 1.51977,0.680508 1.51977,1.520119 0,0.839259 -0.68051,1.519767 -1.51977,1.519767 M 9.25406,4.328231 H 8.06979 C 7.92691,2.649714 6.60294,1.31445 4.92548,1.156758 V 0 H 4.32858 V 1.741311 H 4.65702 C 6.23393,1.759661 7.49758,3.052586 7.47959,4.629856 7.46129,6.206772 6.16796,7.470422 4.59105,7.452431 3.01413,7.434091 1.75013,6.141156 1.76847,4.563886 1.78187,3.410656 2.48743,2.378428 3.55741,1.947686 L 3.33092,1.395589 C 2.11949,1.889831 1.28905,3.024011 1.18427,4.328231 H 0 v 0.597252 h 1.18427 c 0.14182,1.679575 1.46615,3.01625 3.14431,3.173942 v 1.154289 h 0.5969 V 8.099425 C 6.60364,7.941733 7.92797,6.605058 8.06979,4.925483 h 1.18427 z"
        style={{fillOpacity: 1, fillRule: "nonzero", stroke: "none", strokeWidth: 0.352778}}
        id="path332"/>,
    "Target"
);