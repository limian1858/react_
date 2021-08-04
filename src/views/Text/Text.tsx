import React, {useState} from 'react';
import styled from 'styled-components';

const Text: React.FC = () => {
  const [state, setState] = useState('');
  // @ts-ignore
  function Counter({initialCount}) {
    const [count, setCount] = useState(initialCount);
    return (
      <>
        Count: {count}
        <button onClick={() => setCount(initialCount)}>Reset</button>
        <button onClick={() => setCount((prevCount: number) => prevCount - 1)}>-</button>
        <button onClick={() => setCount((prevCount: number) => prevCount + 1)}>+</button>
      </>
    );
  }
  return (
    <StyleDiv>
      Text
    </StyleDiv>
  );
};
const StyleDiv = styled.div`
  color: #FFFFFF;
`;


export default Text;
