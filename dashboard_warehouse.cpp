#include <iostream>
#include <fstream>
using namespace std;

void addWarehouse() {
    string name, location;
    int capacity;

    cout << "\n--- Add Warehouse ---\n";
    cout << "Enter Warehouse Name: ";
    cin >> name;

    cout << "Enter Location: ";
    cin >> location;

    cout << "Enter Storage Capacity: ";
    cin >> capacity;

    ofstream file("warehouse.txt", ios::app);
    file << name << " " << location << " " << capacity << endl;
    file.close();

    cout << "Warehouse Added Successfully!\n";
}

void viewWarehouse() {
    string name, location;
    int capacity;
    int total = 0;

    ifstream file("warehouse.txt");

    cout << "\n--- Warehouse List ---\n";

    while (file >> name >> location >> capacity) {
        cout << "Name: " << name << endl;
        cout << "Location: " << location << endl;
        cout << "Capacity: " << capacity << endl;
        cout << "----------------------\n";
        total++;
    }

    cout << "Total Warehouses: " << total << endl;

    file.close();
}

int main() {
    int choice;

    while (true) {
        cout << "\n==== Dashboard ====\n";
        cout << "1. Add Warehouse\n";
        cout << "2. View Warehouses\n";
        cout << "3. Exit\n";
        cout << "Enter choice: ";
        cin >> choice;

        if (choice == 1) {
            addWarehouse();
        }
        else if (choice == 2) {
            viewWarehouse();
        }
        else if (choice == 3) {
            cout << "Exiting...\n";
            break;
        }
        else {
            cout << "Invalid choice!\n";
        }
    }

    return 0;
}
