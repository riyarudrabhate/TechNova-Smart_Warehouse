#include <iostream>
#include <fstream>
#include <string>
#include <functional>

using namespace std;

// Simple password hashing using STL hash
string hashPassword(string password) {
    hash<string> hasher;
    return to_string(hasher(password));
}

// Check if user already exists
bool userExists(string email) {
    ifstream file("users.txt");
    string storedEmail, storedPhone, storedPassword;

    while (file >> storedEmail >> storedPhone >> storedPassword) {
        if (storedEmail == email) {
            return true;
        }
    }
    return false;
}

// SIGN UP FUNCTION
void signUp() {
    string email, phone, password;

    cout << "\n----- SIGN UP -----\n";
    cout << "Enter Email: ";
    cin >> email;

    if (userExists(email)) {
        cout << "User already exists! Try logging in.\n";
        return;
    }

    cout << "Enter Phone Number: ";
    cin >> phone;

    cout << "Enter Password: ";
    cin >> password;

    string hashedPass = hashPassword(password);

    ofstream file("users.txt", ios::app);
    file << email << " " << phone << " " << hashedPass << endl;
    file.close();

    cout << "Signup Successful!\n";
}

// LOGIN FUNCTION
void login() {
    string email, password;
    string storedEmail, storedPhone, storedPassword;

    cout << "\n----- LOGIN -----\n";
    cout << "Enter Email: ";
    cin >> email;

    cout << "Enter Password: ";
    cin >> password;

    string hashedPass = hashPassword(password);

    ifstream file("users.txt");
    bool found = false;

    while (file >> storedEmail >> storedPhone >> storedPassword) {
        if (storedEmail == email && storedPassword == hashedPass) {
            cout << "Login Successful!\n";
            cout << "Registered Phone: " << storedPhone << endl;
            found = true;
            break;
        }
    }

    if (!found) {
        cout << "Invalid Email or Password!\n";
    }

    file.close();
}

// MAIN MENU
int main() {
    int choice;

    while (true) {
        cout << "\n==== AgriShield Authentication System ====\n";
        cout << "1. Sign Up\n";
        cout << "2. Login\n";
        cout << "3. Exit\n";
        cout << "Enter your choice: ";
        cin >> choice;

        switch (choice) {
            case 1:
                signUp();
                break;
            case 2:
                login();
                break;
            case 3:
                cout << "Exiting system...\n";
                return 0;
            default:
                cout << "Invalid choice! Try again.\n";
        }
    }
}