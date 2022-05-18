function login()
{
const email= document.getElementById("email").value;
    if(email === '')
    {
        alert("Enter emailID");
    }
    else if(!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)))
    {
        alert("Enter vslid email Id");
    }
    const password= document.getElementById("password").value;
    if (password ==='') 
    {
        alert("Enter password");   
    }
    else if(!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/.test(password))
    {
        alert("Enter valid password\n Password should be between 8 to 15 characters and contains at least One lowercase letter, \nOne uppercase letter, \nOne numeric digit, and \nOne special character");
    }
}
function logout()
{
    alert("Successfully Logged out");
    window.location.replace("homepage.html");
}