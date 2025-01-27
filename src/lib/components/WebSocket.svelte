<script lang="ts">
	import { getCookie } from "$lib/logic/main";
	import { onDestroy, onMount } from "svelte";
	import { v4 as uuidv4 } from "uuid";

    let webSocketEstablished = false;
    let ws: WebSocket;
    export let usersList:any[][] = [];
    export let myUserId:number 
    export let update:string= ""
    export let week:number
    export let messageSent:any | object;
    export let User:any
    export let AppUsage:string
    export let positions: { x: number; y: number, id_user: number, presence: string }[]
    export let lab:string = ""
    export let draggingUser:{ x: number; y: number, id_user: number, presence: string }
    export let tableData:any[]

    const dayIndex:any = {
        "lunedi": 0,
        "martedi": 1,
        "mercoledi": 2,
        "giovedi": 3,
        "venerdi": 4,
        "sabato": 5,
        "domenica": 6,
    }

    $:if(update != ""){
        if(messageSent != undefined && webSocketEstablished) sendMessage(messageSent)
        console.log(messageSent)
    }
  
    const establishWebSocket = () => {
      if (webSocketEstablished) return;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      ws = new WebSocket(`${protocol}//${window.location.host}/websocket`);
      ws.addEventListener('open', event => {
        webSocketEstablished = true;
        console.log('[websocket] connection open', event);
      });
      ws.addEventListener('close', event => {
        console.log('[websocket] connection closed', event);
      });
      ws.addEventListener('message', async (event) => {
        console.log('[websocket] message received', event);
        let message = JSON.parse(event.data)
        console.log(message)
        if(typeof(message) == 'object') {
            if(message.type == "update") {
                let serverRespond = JSON.parse(message.serverRespond)
                if(serverRespond.Route == "presence" && AppUsage == "presence") {
                    let day = serverRespond.UpdatedDay.day.value
                    let value = serverRespond.UpdatedDay.value
                    let columnIndex:number = 0
                    if(week == 52 && serverRespond.UpdatedDay.week_number.value-week < 0) columnIndex = 1
                    else columnIndex = serverRespond.UpdatedDay.week_number.value-week
                    for(let i=0; i<usersList[columnIndex].length; i++) {
                        if(usersList[columnIndex][i].idUtente == serverRespond.UpdatedDay.id.value) usersList[columnIndex][i].setDay(dayIndex[day], value)
                    }
                    usersList = usersList
                    console.log(usersList)
                }
                if(serverRespond.Route == "find" && AppUsage == "find") {
                    let founded:boolean = false
                    for(let i=0; i<positions.length; i++) {
                        if(positions[i].id_user == serverRespond.updatePosition.id_utente) {
                            founded = true
                            if(lab == serverRespond.updatePosition.lab) {
                                positions[i].x = serverRespond.updatePosition.posx
                                positions[i].y = serverRespond.updatePosition.posy
                                positions[i].presence = serverRespond.updatePosition.presence
                                positions = positions
                                console.log(positions)
                            }
                            else {
                                positions.splice(i, 1)
                            }
                        }
                    }
                    if(lab == serverRespond.updatePosition.lab && !founded) positions.push(
                        {
                            x: serverRespond.updatePosition.posx,
                            y: serverRespond.updatePosition.posy,
                            id_user: serverRespond.updatePosition.id_utente,
                            presence: serverRespond.updatePosition.presence
                        }
                    )
                    positions = positions
                    console.log(positions)
                }
                if(serverRespond.Route == "roadmap" && AppUsage == "roadmap") {
                    for(let y=0; y< tableData.length; y++) {
                        for(let i=0; i<tableData[y].length; i++) {
                            if(tableData[y][i].id == serverRespond.updateProjects.id) {
                                let GroupIndex = -1
                                if(serverRespond.updateProjects.group == "CI") {
                                    GroupIndex = 0
                                }else if(serverRespond.updateProjects.group == "EM") {
                                    GroupIndex = 1
                                }else if(serverRespond.updateProjects.group == "DI") {
                                    GroupIndex = 2
                                }else if(serverRespond.updateProjects.group == "AM") {
                                    GroupIndex = 3
                                }else if(serverRespond.updateProjects.group == "DA") {
                                    GroupIndex = 4
                                }else if(serverRespond.updateProjects.group == "MA") {
                                    GroupIndex = 5
                                }else if(serverRespond.updateProjects.group == "TS") {
                                    GroupIndex = 6
                                }else if(serverRespond.updateProjects.group == "TI") {
                                    GroupIndex = 7
                                }
                                console.log(serverRespond.updateProjects.group)
                                tableData[y][i].fromDay = serverRespond.updateProjects.fromDay
                                tableData[y][i].fromMonth = serverRespond.updateProjects.fromMonth
                                tableData[y][i].fromYear = serverRespond.updateProjects.fromYear
                                tableData[y][i].toDay = serverRespond.updateProjects.toDay
                                tableData[y][i].toMonth = serverRespond.updateProjects.toMonth
                                tableData[y][i].toYear = serverRespond.updateProjects.toYear
                                tableData[y][i].TitleName = serverRespond.updateProjects.TitleName
                                tableData[y][i].description = serverRespond.updateProjects.description
                                tableData[y][i].group = serverRespond.updateProjects.group
                                tableData[y][i].color = serverRespond.updateProjects.color

                                if(GroupIndex != -1) {
                                    const element = tableData[y].splice(i, 1)[0];
                                    tableData[GroupIndex].push(element);
                                }
                            }
                        }
                    }
                    console.log(serverRespond.updateProjects.id)
                    tableData = tableData
                }
            }
            else {
                if(AppUsage == "presence") {
                    if(message.type == "get") {
                        console.log(message.value)
                        if(message.subdivideNumber) {
                            let index = 0
                            usersList = []
                            let values:any[][] = []
                            for(let i=0; i<message.subdivideNumber; i++) {
                                values.push([])
                                for(let y=0; y<message.value.length / message.subdivideNumber; y++) {
                                    values[i][y] = message.value[index]
                                    index += 1
                                }
                            }
                            
                            for (let i = 0; i < values.length; i++) {
                                usersList[i] = await Promise.all(values[i].map(async (user: any) => {
                                    const userGot = await getUserName(user.id_utente);
                                    const userName = (userGot.nome).toString();
                                    const userSurname = (userGot.cognome).toString();
                                    return new User(
                                        user.id,
                                        user.id_utente,
                                        userName,
                                        userSurname,
                                        user.lunedi,
                                        user.martedi,
                                        user.mercoledi,
                                        user.giovedi,
                                        user.venerdi,
                                        user.week_number,
                                        user.year
                                    );
                                }));
                            }

                            for (let i = 0; i < usersList.length; i++) {
                                for(let y=0; y< usersList[i].length; y++) {
                                    if(usersList[i][y].idUtente == myUserId) {
                                        let old
                                        old = usersList[i][0]
                                        usersList[i][0] = usersList[i][y]
                                        usersList[i][y] = old
                                    }
                                }
                            }

                            console.log(usersList)
                        }
                    }
                }
                if(AppUsage == "find") {
                    console.log(message.value)
                    positions = []
                    let alreadyExists:boolean = false
                    for(let i=0; i<message.value.length; i++) {
                        positions[i] = {
                            id_user: message.value[i].id_utente,
                            x: message.value[i].posx,
                            y: message.value[i].posy,
                            presence: message.value[i].presence,
                        }
                        if(draggingUser) {
                            if(Object.keys(draggingUser).length != 0) {
                                if(draggingUser.id_user == message.value[i].id_utente) {
                                    alreadyExists = true
                                } 
                            }
                        }
                    }
                    if(!alreadyExists) {
                        if(draggingUser) {
                            if(Object.keys(draggingUser).length != 0) {
                                positions.push(draggingUser)
                            }
                        }
                    }
                }
                if(AppUsage == "roadmap") {
                    console.log(message.value)
                    let result = message.value
                    for(let i=0; i< result.length; i++) {
                        let GroupIndex:number = -1
                        let totalGoals = 1
                        if(result[i].projectGroup == "CI") {
                            GroupIndex = 0
                        }else if(result[i].projectGroup == "EM") {
                            GroupIndex = 1
                        }else if(result[i].projectGroup == "DI") {
                            GroupIndex = 2
                        }else if(result[i].projectGroup == "AM") {
                            GroupIndex = 3
                        }else if(result[i].projectGroup == "DA") {
                            GroupIndex = 4
                        }else if(result[i].projectGroup == "MA") {
                            GroupIndex = 5
                        }else if(result[i].projectGroup == "TS") {
                            GroupIndex = 6
                        }else if(result[i].projectGroup == "TI") {
                            GroupIndex = 7
                        }
                        if(GroupIndex != -1) {
                            let exist:boolean = false
                            for(let y=0; y<tableData[GroupIndex].length; y++) {
                                if(tableData[GroupIndex][y].id == result[i].id) {
                                    exist = true
                                }
                            }
                            if(!exist) {
                                tableData[GroupIndex].push(
                                    {
                                        id: result[i].id,
                                        fromDay: result[i].start_day,
                                        fromMonth: result[i].start_month,
                                        fromYear: result[i].start_year,
                                        toDay: result[i].end_day,
                                        toMonth: result[i].end_month,
                                        toYear: result[i].end_year,
                                        totalGoals: totalGoals,
                                        compleatedGoals: 0,
                                        color: result[i].color,
                                        update: uuidv4(),
                                        TitleName: result[i].title,
                                        description: result[i].description,
                                        group: result[i].projectGroup
                                    }
                                )
                            }
                        }
                    }
                    tableData = tableData
                    console.log(tableData)
                }
            }
        }
      });
    };

    onMount(establishWebSocket)

    async function getUserName(id: number): Promise<any> {
        if(getCookie("idToken")) {
            try {
                const response = await fetch(`/api/database/getUser?id=${id}&authEmail=${getCookie("idToken")}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                return data[0];
            } catch (error) {
                console.log('Retrying after Error', error);
            }
        }else {
            return null
        }
	}

    function sendMessage (message:object) {
        if (ws && ws.readyState === WebSocket.OPEN)  {
            ws.send(JSON.stringify(message));
        } else {
            if(ws) console.error('WebSocket is not open. ReadyState:', ws.readyState);
        }
    }

    onDestroy(() => {
        if (ws) {
        ws.close(); // Close the websocket on component unmount
        console.log('[websocket] connection closed (cleanup)');
        }
    });
  </script>