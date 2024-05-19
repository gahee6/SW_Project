import { Link } from 'react-router-dom';

function Main() {
    return (
      <div className="Main">
        <h1>산행</h1>
        <p>환영합니다!</p>
        <Link to="/app"><button>시작하기</button></Link>
      </div>
    );
  }
  
  export default Main;