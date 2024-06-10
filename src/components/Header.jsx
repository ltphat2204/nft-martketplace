import { Button, Container, Nav, NavDropdown, Navbar } from 'react-bootstrap';
import { PersonCircle } from 'react-bootstrap-icons'

export default function Header() {
    return (
        <Navbar expand="lg" className="bg-body-tertiary" data-bs-theme="dark">
            <Container>
                <Navbar.Brand href="/">NFT MARTKETPLACE</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                    <Nav>
                        <Nav.Link href="/" active>Home</Nav.Link>
                        <Nav.Link href="/explore" active>Explore</Nav.Link>
                        <Navbar.Text><Button variant="light">Connect Wallet</Button></Navbar.Text>
                        <NavDropdown title={<PersonCircle/>} style={{fontSize: 22, marginLeft: 8}}>

                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Container>            
        </Navbar>
    )
}