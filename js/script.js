// GLOBAL

var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
var rankingValue = ["NC", "E6", "E4", "E2", "E0", "D6", "D4", "D2", "D0", "C6", "C4", "C2", "C0", "B6", "B4", "B2", "B0", "A"];

var Week = new Array(23);
var Teams = [];

var NumTeam = 0;

var MatchData = {};

// Function


function FirstInit() {
    //import MatchData
    //if (localStorage.getItem("MatchData") != null) {MatchData = JSON.parse(localStorage.getItem("MatchData"))};
    importMatchData(importMatches);
    //importMatches();
    
}

function importMatchData(_Callback) {
    let req = new XMLHttpRequest();

    req.onreadystatechange = () => {
        if (req.readyState == XMLHttpRequest.DONE) {
            console.log(req.responseText);
            MatchData = JSON.parse(req.responseText)
            _Callback();
        }
    };

    req.open("GET", "https://api.myjson.com/bins/y3sca", true);
    req.send();
}

function updateMatchData(_Callback) {
    let req = new XMLHttpRequest();

    req.onreadystatechange = () => {
        if (req.readyState == XMLHttpRequest.DONE) {
            console.log(req.responseText);
            _Callback();
        }
    };

    req.open("PUT", "https://api.myjson.com/bins/y3sca", true);
    req.setRequestHeader("Content-type", "application/json");
    req.send(JSON.stringify(MatchData));
}

function Init() {
    for (var i = 1; i < Week.length; i++) {
        var test = Week[i];
        var w = document.createElement("Div");
        w.className = "WeekContainer"
        var t = document.createElement("p");
        t.className = "titreSemaine"
        t.innerText = "Semaine " + i
        w.appendChild(t);

        for (var i2 = 0; i2 < NumTeam; i2++) {
            var m = Week[i][letters[i2]];
            var b = document.createElement("Button");
            b.id = m.MatchId;
            b.name = i + "_" + letters[i2];
            if (m.DetailsCreated) {
                if (MatchData[m.MatchId] == null) {
                    b.className = "MatchButton OrangeButton";
                } else {
                    b.className = "MatchButton GreenButton";
                }
            } else {
                b.disabled = true;
                b.className = "MatchButton RedButton";
            }
            if (m.IsAwayForfeited == "true" || m.IsHomeForfeited == "true") {
                b.disabled = true;
                b.className = "MatchButton";
            }
            b.innerText = m.HomeTeam + " - " + m.AwayTeam;
            b.addEventListener('click', showMatchDialog);
            w.appendChild(b);
        }


        document.getElementById("Matches").appendChild(w);
    }

    hideLoader();
};

function importMatches() {
    var xml = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tab="http://api.frenoy.net/TabTAPI">'
            +   '<soapenv:Header/>'
            +   '<soapenv:Body>'
            +       '<tab:GetMatchesRequest>'
            +           '<tab:Club>N115</tab:Club>'
            //+           '<tab:ShowDivisionName>yes</tab:ShowDivisionName>'
            +           '<tab:WithDetails>yes</tab:WithDetails>'
            +       '</tab:GetMatchesRequest>'
            +   '</soapenv:Body>'
            + '</soapenv:Envelope>'


    soap(xml, setMatches, Init);
}


function showMatchDialog(event) {
    var id = event.currentTarget.name.split('_');
    var match = Week[id[0]][id[1]];


    document.getElementById("md_Title").innerText = match.MatchId;
    
    document.getElementById("md_HT").innerText = match.HomeTeam
    document.getElementById("md_HTScore").innerText = match.Score.split("-")[0];
    for (var i = 1; i < match.HPs.length; i++) {
        document.getElementById("md_HPlayer"+i+"Order").innerText = match.HPs[i].position;
        document.getElementById("md_HPlayer"+i+"Name").innerText = match.HPs[i].name;
        document.getElementById("md_HPlayer"+i+"Ranking").innerText = match.HPs[i].ranking;
        document.getElementById("md_HPlayer"+i+"Victory").innerText = match.HPs[i].victory;
        if (MatchData[match.MatchId] == null) {
            document.getElementById("md_HPlayer"+i+"Ignore").checked = false;
        } else {
            document.getElementById("md_HPlayer"+i+"Ignore").checked = MatchData[match.MatchId].HPs[i];
        }
        
    }

    document.getElementById("md_AT").innerText = match.AwayTeam
    document.getElementById("md_ATScore").innerText = match.Score.split("-")[1];
    for (var i = 1; i < match.APs.length; i++) {
        document.getElementById("md_APlayer"+i+"Order").innerText = match.APs[i].position;
        document.getElementById("md_APlayer"+i+"Name").innerText = match.APs[i].name;
        document.getElementById("md_APlayer"+i+"Ranking").innerText = match.APs[i].ranking;
        document.getElementById("md_APlayer"+i+"Victory").innerText = match.APs[i].victory;
        if (MatchData[match.MatchId] == null) {
            document.getElementById("md_APlayer"+i+"Ignore").checked = false;
        } else {
            document.getElementById("md_APlayer"+i+"Ignore").checked = MatchData[match.MatchId].APs[i];
        }
    }
    

    
    document.getElementById("MatchesDetails").showModal();
}

function closeMatchDialog() {
    document.getElementById('MatchesDetails').close();
}

function saveMatchDialog() {
    var md = {HPs: new Array(5), APs: new Array(5)};
    for (var i = 1; i < md.HPs.length; i++) {
        md.HPs[i] = document.getElementById("md_HPlayer"+i+"Ignore").checked;
    }
    for (var i = 1; i < md.APs.length; i++) {
        md.APs[i] = document.getElementById("md_APlayer"+i+"Ignore").checked;
    }

    var m_id = document.getElementById("md_Title").innerText

    MatchData[m_id] = md;
    localStorage.setItem("MatchData",JSON.stringify(MatchData));
    updateMatchData();

    document.getElementById(m_id).className = "MatchButton GreenButton"

    document.getElementById('MatchesDetails').close();
}

//Function HTML Dynamic

function activateLoader() {
    document.getElementById("loader").className = "loader loader-default is-active";
}

function hideLoader() {
    document.getElementById("loader").className = "loader loader-default";
}


//Function Utils

function soap(strRequest, callback, _afterCallback) {
    var xmlhttp = new XMLHttpRequest();

    //replace second argument with the path to your Secret Server webservices
    xmlhttp.open('POST', "https://api.vttl.be/0.7/index.php?s=vttl", true);


    //specify request headers
    xmlhttp.setRequestHeader('Content-Type', 'text/xml; charset=utf-8');
    //xmlhttp.setRequestHeader('SOAPAction', '"urn:thesecretserver.com/Authenticate"';);

    //FOR TESTING: display results in an alert box once the response is received
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4) {
            //alert(xmlhttp.responseText);
            callback(xmlhttp.responseText, _afterCallback);
        }
    };

    //send the SOAP request
    xmlhttp.send(strRequest);
};


function xmlToPlayer(nodeCollection) {
    var Position;
    var FirstName;
    var LastName;
    var Ranking;
    var VictoryCount;
    var IsForfeited = false;

    for (var i = 0; i < nodeCollection.length; i++) {       
        switch (nodeCollection[i].localName) {
            case "Position":
                Position = nodeCollection[i].innerHTML;
                break;
            case "FirstName":
                FirstName = nodeCollection[i].innerHTML;
                break;
            case "LastName":
                LastName = nodeCollection[i].innerHTML;
                break;
            case "Ranking":
                Ranking = nodeCollection[i].innerHTML;
                if (Ranking == "NG") {
                    Ranking = "NC";
                }
                break;
            case "VictoryCount":
                VictoryCount = nodeCollection[i].innerHTML;
                break;
            case "IsForfeited":
                IsForfeited = (nodeCollection[i].innerHTML == "true");
                break;
        }
    }

    var p = {
        position: Position,
        name: FirstName + "   " + LastName[0] + ".",
        ranking: Ranking,
        victory: VictoryCount,
        won: [],
        lost: []
    }
    if (IsForfeited) {
        p.victory = "WO";
    }
    return p;
}

function xmlToMatch(nodeCollection) {
    var Position;
    var HomePlayerMatchIndex;
    var AwayPlayerMatchIndex;
    var IsAwayForfeited = false;
    var IsHomeForfeited = false;
    var AwaySetCount = 0;
    var HomeSetCount = 0;

    for (var i = 0; i < nodeCollection.length; i++) {
        switch (nodeCollection[i].localName) {
            case "Position":
                Position = parseInt( nodeCollection[i].innerHTML);
                break;
            case "HomePlayerMatchIndex":
                HomePlayerMatchIndex = parseInt( nodeCollection[i].innerHTML);
                break;
            case "AwayPlayerMatchIndex":
                AwayPlayerMatchIndex = parseInt( nodeCollection[i].innerHTML);
                break;
            case "IsAwayForfeited":
                IsAwayForfeited = (nodeCollection[i].innerHTML == "true");
                break;
            case "IsHomeForfeited":
                IsHomeForfeited = (nodeCollection[i].innerHTML == "true");
                break;
            case "HomeSetCount":
                HomeSetCount = parseInt(nodeCollection[i].innerHTML);
                break;
            case "AwaySetCount":
                AwaySetCount = parseInt(nodeCollection[i].innerHTML);
                break;
        }
    }

    var m = {
        position: Position,
        hpi: HomePlayerMatchIndex,
        api: AwayPlayerMatchIndex,
        homeWon: (HomeSetCount > AwaySetCount),
        wo: (IsHomeForfeited || IsAwayForfeited)
    }
    return m;
}


// Callback Function

function setMatches(resp, callback) {
    Week = [];
    for (var i = 1; i <= 22; i++) { Week[(i)] = {} }

    var oParser = new DOMParser();
    var oDOM = oParser.parseFromString(resp, "application/xml");

    var matches = oDOM.firstElementChild.firstElementChild.firstElementChild.children;
    var nameSpace = matches[0].namespaceURI;

    var LastTeamLetter = "";
    var NumberOfTeam = 0;

    for (i = 1; i < matches.length; i++) {

        var week = null;
        var MatchId = null;
        var HomeClub = null;
        var HomeTeam = null;
        var AwayClub = null;
        var AwayTeam = null;
        var IsHomeForfeited = null;
        var IsAwayForfeited = null;
        var MatchDetails = null;
        var DetailsCreated = false;
        var Score = null;

        var Date = "";
        var Time = "";
        var _Date = "";
        var _Time = "";

        for (var _i = 0; _i < matches[i].children.length; _i++) {
            switch (matches[i].children[_i].localName) {
                case "WeekName":
                    week = matches[i].children[_i].innerHTML;
                    if (week[0] == 0) { week = week.substr(1) }
                    week = parseInt(week);
                    break;
                case "MatchId":
                    MatchId = matches[i].children[_i].innerHTML;
                    break;
                case "HomeClub":
                    HomeClub = matches[i].children[_i].innerHTML;
                    break;
                case "HomeTeam":
                    HomeTeam = matches[i].children[_i].innerHTML;
                    break;
                case "AwayClub":
                    AwayClub = matches[i].children[_i].innerHTML;
                    break;
                case "AwayTeam":
                    AwayTeam = matches[i].children[_i].innerHTML;
                    break;
                case "IsHomeForfeited":
                    IsHomeForfeited = matches[i].children[_i].innerHTML;
                    break;
                case "IsAwayForfeited":
                    IsAwayForfeited = matches[i].children[_i].innerHTML;
                    break;
                case "Date":
                    _Date = matches[i].children[_i].innerHTML;
                    break;
                case "Time":
                    _Time = matches[i].children[_i].innerHTML;
                    break;
                case "Score":
                    Score = matches[i].children[_i].innerHTML;
                    break;
                case "MatchDetails":
                    MatchDetails = matches[i].children[_i].children;
                    DetailsCreated = matches[i].children[_i].children[0].innerHTML == "true";
                    break;
            }
        }

        if (AwayClub != "-" && HomeClub != "-") {
            Date = _Date;
            Time = _Time.substring(0, _Time.length - 3);
        } else if (AwayClub == "-") { AwayTeam = "BYE" }
        else if (HomeClub == "-") { HomeTeam = "BYE" }


        var isHome = (HomeClub == "N115");

        var TeamLetter;
        if (isHome) {
            TeamLetter = HomeTeam[HomeTeam.length - 1];
        } else {
            TeamLetter = AwayTeam[AwayTeam.length - 1];
        }
        if (TeamLetter != LastTeamLetter) {
            NumberOfTeam++;
            LastTeamLetter = TeamLetter;
        }


        //Match Details
        var HPs = [];
        var APs = [];
        var Matchs = [];

        if (MatchDetails[0].innerHTML == 'true') {
                    

            for (var i3 = 0; i3 < MatchDetails.length; i3++) {
                switch (MatchDetails[i3].localName) {
                    case "HomePlayers":
                        for (var j = 0; j < MatchDetails[i3].children.length; j++) {
                            if (MatchDetails[i3].children[j].localName == "Players") {
                                var p = xmlToPlayer(MatchDetails[i3].children[j].children);
                                HPs[p.position] = p;
                            }
                        }                                
                        break;
                    case "AwayPlayers":
                        for (var j = 0; j < MatchDetails[i3].children.length; j++) {
                            if (MatchDetails[i3].children[j].localName == "Players") {
                                var p = xmlToPlayer(MatchDetails[i3].children[j].children);
                                APs[p.position] = p;
                            }
                        }
                        break;
                    case "IndividualMatchResults":
                        var m = xmlToMatch(MatchDetails[i3].children);
                        Matchs[m.position] = m;
                        break;
                }
            }

            for (var i4 = 1; i4 < Matchs.length; i4++) {
                var m = Matchs[i4];
                if (!m.wo) {
                    if (m.homeWon) {
                        HPs[m.hpi].won.push(APs[m.api].ranking);
                        APs[m.api].lost.push(HPs[m.hpi].ranking);
                    } else {
                        HPs[m.hpi].lost.push(APs[m.api].ranking);
                        APs[m.api].won.push(HPs[m.hpi].ranking);
                    }
                }
            }

        }

        Week[week][TeamLetter] = {};

        Week[week][TeamLetter]["MatchId"] = MatchId;
        Week[week][TeamLetter]["Date"] = Date;
        Week[week][TeamLetter]["Time"] = Time;
        Week[week][TeamLetter]["HomeClub"] = HomeClub;
        Week[week][TeamLetter]["HomeTeam"] = HomeTeam;
        Week[week][TeamLetter]["AwayClub"] = AwayClub;
        Week[week][TeamLetter]["AwayTeam"] = AwayTeam;
        Week[week][TeamLetter]["isHome"] = isHome;
        Week[week][TeamLetter]["Score"] = Score;
        Week[week][TeamLetter]["IsHomeForfeited"] = IsHomeForfeited;
        Week[week][TeamLetter]["IsAwayForfeited"] = IsAwayForfeited;
        Week[week][TeamLetter]["DetailsCreated"] = DetailsCreated;
        Week[week][TeamLetter]["HPs"] = HPs;
        Week[week][TeamLetter]["APs"] = APs;
        Week[week][TeamLetter]["Matchs"] = Matchs;


    }

    NumTeam = NumberOfTeam;
    callback()
}



