import React, { useState } from 'react';
import './App.css';
import ApolloClient from 'apollo-boost';
import { ApolloProvider, useQuery, useMutation  } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { Table, Button, Modal, Form, Jumbotron, Container } from 'react-bootstrap';
import moment from 'moment'


const USER_ID = '5d72be4d68e1cbfe6001bb49'

const GET_USER = gql`
  query getUser($userId: String!)
  {
    user(userId: $userId){
      age
      email
      firstName
      id
      lastName
      mass
      runs {
        caloriesBurned
        date
        distance
        id
        time
        userId
      }
    }
  }
`;

const ADD_RUN = gql`
  mutation addRun(
    $userId: String!
    $time: Float!
    $distance: Float!
    $date: DateTime
  ) {
    addRun (runInput: {
      userId: $userId,
      time: $time,
      distance: $distance,
      date: $date
      }) {
      run {
        id
        time
        distance
        date
        caloriesBurned
      }
    }
  }
`;

const client = new ApolloClient({
  uri: 'http://localhost:5000/graphql'
});

const App = () => (
  <ApolloProvider client={client}>
    <Runs></Runs>
  </ApolloProvider>
);

const Runs = () => {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const { loading, error, data } = useQuery(GET_USER, {
    variables: {
      userId: USER_ID
    }
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error! Please make sure that user exists and that the value of USER_ID is correct.</p>;

  return (
    <Container fluid>
      <Jumbotron>
        <h1>Hi {data.user.firstName}!</h1>
      </Jumbotron>
      <Table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Distance (kilometres)</th>
            <th>Time (hours)</th>
            <th>Calories Burned (per minute)</th>
          </tr>
        </thead>
        <tbody>
          {data.user.runs.map(run => <Run key={run.id} runData={run}/>)}
        </tbody>
      </Table>
      <Button variant="primary" onClick={handleShow}>Add Run</Button>
      { show && <AddRunModal show={show} handleClose={handleClose}/> }
    </Container>
  );
}

const Run = ({runData}) => {
  const {date, distance, time, caloriesBurned} = runData;
  const formattedDate = moment(date).format('YYYY-MM-DD hh:mm');

  return (
    <tr>
      <td>{formattedDate}</td>
      <td>{distance}</td>
      <td>{time}</td>
      <td>{caloriesBurned}</td>
    </tr>
  );
}

const AddRunModal = ({show, handleClose}) => {
  const [time, setTime] = useState(1);
  const [distance, setDistance] = useState(1);
  const [date, setDate] = useState(new Date().toISOString());

  const handleSave = () => {
    addRun()
    .then(() => {
      handleClose();
      window.location.reload();
    })
    .catch(() =>
      alert("Unable to add run, please check the input")
    )
  }

  const [addRun] = useMutation(ADD_RUN, {
    variables: {
        userId: USER_ID,
        time: time,
        distance: distance,
        date: date
    }
  });

  return (
      <Modal show={show}>
        <Modal.Body>
          <Form>
            <label>
              Time:
              <input
                type="number"
                value={time}
                onChange={e => setTime(e.target.value)}
              />
            </label>
            <label>
              Distance:
              <input
                type="number"
                value={distance}
                onChange={e => setDistance(e.target.value)}
              />
            </label>
            <label>
              Date:
              <input
                type="text"
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </label>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
  );
}

export default App;
