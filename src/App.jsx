import React, { useState } from 'react';
import './App.css';
import ApolloClient from 'apollo-boost';
import { ApolloProvider, useQuery, useMutation  } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { Table, Button, Modal, Form } from 'react-bootstrap'

const USER_ID = '5d72a99fdd48d93e06c919d0'

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
    $time: Int!
    $distance: Float!
    $date: DateTime
  ) {
    addRun (runInput: {userId: $userId, time: $time, distance: $distance, date: $date}) {
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
  if (error) return <p>Error...</p>;

  return (
    <React.Fragment>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Date</th>
            <th>Distance</th>
            <th>Time</th>
            <th>Calories Burned</th>
          </tr>
        </thead>
        <tbody>
          {data.user.runs.map(run => 
            <tr key={run.id}>
              <td>{run.date}</td>
              <td>{run.distance}</td>
              <td>{run.time}</td>
              <td>{run.caloriesBurned}</td>
            </tr>  
          )}
        </tbody>
      </Table>
      <Button variant="primary" onClick={handleShow}>Add Run</Button>
      { show && <AddRunModal show={show} handleClose={handleClose}/> }
    </React.Fragment>
  );
}

const AddRunModal = ({show, handleClose}) => {
  const [time, setTime] = useState(1);
  const [distance, setDistance] = useState(1);
  const [date, setDate] = useState(new Date().toISOString());

  const [addRun] = useMutation(ADD_RUN, {
    variables: {
        userId: USER_ID,
        time: time,
        distance: distance,
        date: date
    },
  });

  return (
      <Modal show={show} onHide={handleClose}>
        <Modal.Body>
        <Form>
          <label>
            Time:
            <input
              type="text"
              value={time}
              onChange={e => setTime(e.target.value)}
            />
          </label>
          <label>
            Distance:
            <input
              type="text"
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
          <Button variant="primary" onClick={addRun}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
  );
}

export default App;
