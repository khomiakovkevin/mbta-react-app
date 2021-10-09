import './App.css';
import { Fragment, useState, useEffect } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table'
import 'bootstrap/dist/css/bootstrap.min.css';

function cleanData(incomingData) {
      var reliableData = [];
      // In some cases, predictions are coming without arrival time
      // We don't want to show those.
      for (var i = 0; i < incomingData.length; i++) {
        if (incomingData[i].attributes.arrival_time !== null && incomingData[i].attributes.status !== null) {
          var inboundDir = incomingData[i].attributes.direction_id === 0;
          incomingData[i].attributes.direction = (inboundDir ? "Inbound" : "Outbound");
          // Converting date in ISO format to string representing time
          const arrivalTime = new Date(incomingData[i].attributes.arrival_time);
          const arrivalTimeStr = arrivalTime.toLocaleTimeString();
          incomingData[i].attributes.arrival_time = arrivalTimeStr;
          reliableData.push(incomingData[i]);
        }
      }
      return reliableData;
}

function App() {
  const [routeData, setRouteData] = useState({ data: []});
  const [stopUrl, setStopUrl] = useState('https://api-v3.mbta.com/stops?route=CR-Fairmount')
  const [stopData, setStopData] = useState({ data: []});
  const [scheduleData, setScheduleData] = useState({ data: []});
  const [scheduleUrl, setScheduleUrl] = useState('https://api-v3.mbta.com/predictions?route=CR-Fairmount&stop=place-DB-0095');
  const [route, setRoute] = useState("CR-Fairmount")

    // Fetching all routes
    useEffect(() => {
      const fetchData = async () => {
        const result = await axios('https://api-v3.mbta.com/routes?type=2');
        setRouteData(result.data);
      };
  
      fetchData();
    }, []);

    // For selected line, fetching all stops
    useEffect(() => {
      const fetchData = async () => {
        const result = await axios(stopUrl);
   
        setStopData(result.data);
      };
   
      fetchData();
    }, [stopUrl, scheduleUrl]);

    // For selected stop, fetching predicted schedule
    useEffect(() => {
      const fetchData = async () => {
        const result = await axios(scheduleUrl);
        var incomingData = result.data.data;
        var reliableData = cleanData(incomingData);
        setScheduleData({data: reliableData});
      };
   
      fetchData();
    }, [stopUrl, scheduleUrl]);

  return (

    <Fragment>
      <br></br>
      <h1>MBTA Commuter Rail Schedule</h1>
      <br></br>
      <div className="container">
        <b>Select Route: </b>
        <select className="form-select" onChange={(line) => { setStopUrl(`https://api-v3.mbta.com/stops?route=${line.currentTarget.value}`); setRoute(line.currentTarget.value) }}>
          {routeData.data.map(item => (
            <option value={item.id}>{item.attributes.long_name}</option>
          ))}
        </select>

        <br></br>
        <b>Select Station: </b>
        <select className="form-select" onChange={(line) => { setScheduleUrl(`https://api-v3.mbta.com/predictions?route=${route}&stop=${line.currentTarget.value}`); }}>
          {stopData.data.map(item => (
            <option value={item.id} >{item.attributes.name}</option>
          ))}
        </select>
      </div>
      <br></br>
      <div className="container">
        <h4>Schedule for {route}</h4>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Line/Route</th>
              <th>Arrival Time</th>
              <th>Direction</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
          {scheduleData.data.map(item => (
            <tr>
              <td>{route}</td>
              <td>{item.attributes.arrival_time}</td>
              <td>{item.attributes.direction}</td>
              <td>{item.attributes.status}</td>
            </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </Fragment>

  )

}

export default App;
