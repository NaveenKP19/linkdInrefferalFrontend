import { Component } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import {  ChangeDetectorRef } from '@angular/core';
interface UserAccount {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  location: string;
  linkedinProfileUrl: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserAccountRequest {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phoneNumber: string;
  location: string;
  linkedinProfileUrl: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

  private readonly apiUrl =
    'https://linkdln-referral-backend.onrender.com/api/v1/users';

  users: UserAccount[] = [];

  selectedUser: UserAccount | null = null;

  editingId: number | null = null;

  loading = false;

  message = '';
  errorMessage = '';

  form = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    location: '',
    linkedinProfileUrl: ''
  };

  constructor(  private http: HttpClient,
  private cdr: ChangeDetectorRef) {}

  // GET ALL USERS
 
loadUsers(): void {
  this.loading = true;
  this.message = '';
  this.errorMessage = '';

  this.http.get<UserAccount[]>(this.apiUrl).subscribe({
    next: (response) => {
      console.log('Users received:', response);

      this.users = response;
      this.loading = false;
      this.message = 'Users loaded successfully.';

      // Notify Angular to update the template
      this.cdr.markForCheck();
    },
    error: (error: HttpErrorResponse) => {
      this.loading = false;
      this.handleError(error);

      this.cdr.markForCheck();
    }
  });
}


  // CREATE / UPDATE USER
  saveUser(): void {

    this.message = '';
    this.errorMessage = '';

    if (
      !this.form.firstName ||
      !this.form.lastName ||
      !this.form.email
    ) {
      this.errorMessage = 'First name, last name and email are required.';
      return;
    }

    if (this.editingId === null) {

      const request: UserAccountRequest = {
        firstName: this.form.firstName,
        lastName: this.form.lastName,
        email: this.form.email,
        password: this.form.password,
        phoneNumber: this.form.phoneNumber,
        location: this.form.location,
        linkedinProfileUrl: this.form.linkedinProfileUrl
      };

      this.http.post<UserAccount>(this.apiUrl, request).subscribe({
        next: () => {
          this.message = 'User account created successfully.';
          this.resetForm();
          this.loadUsers();
        },
        error: (error: HttpErrorResponse) => {
          this.handleError(error);
        }
      });

    } else {

      const request: UserAccountRequest = {
        firstName: this.form.firstName,
        lastName: this.form.lastName,
        email: this.form.email,
        phoneNumber: this.form.phoneNumber,
        location: this.form.location,
        linkedinProfileUrl: this.form.linkedinProfileUrl
      };

      this.http.put<UserAccount>(
        `${this.apiUrl}/${this.editingId}`,
        request
      ).subscribe({
        next: () => {
          this.message = 'User account updated successfully.';
          this.resetForm();
          this.loadUsers();
        },
        error: (error: HttpErrorResponse) => {
          this.handleError(error);
        }
      });

    }
  }

  // GET USER BY ID
  viewUser(id: number): void {

    this.http.get<UserAccount>(`${this.apiUrl}/${id}`).subscribe({
      next: (response) => {
        this.selectedUser = response;
      },
      error: (error: HttpErrorResponse) => {
        this.handleError(error);
      }
    });
  }

  // EDIT USER
  editUser(user: UserAccount): void {

    this.editingId = user.id;

    this.form = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '',
      phoneNumber: user.phoneNumber,
      location: user.location,
      linkedinProfileUrl: user.linkedinProfileUrl
    };

    this.selectedUser = null;
  }

  // DELETE USER
  deleteUser(id: number): void {

    if (!confirm('Are you sure you want to deactivate this account?')) {
      return;
    }

    this.http.delete<void>(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.message = 'User account deactivated successfully.';
        this.selectedUser = null;
        this.loadUsers();
      },
      error: (error: HttpErrorResponse) => {
        this.handleError(error);
      }
    });
  }

  // RESET FORM
  resetForm(): void {

    this.editingId = null;

    this.form = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phoneNumber: '',
      location: '',
      linkedinProfileUrl: ''
    };
  }

  // ERROR HANDLING
  private handleError(error: HttpErrorResponse): void {

    console.error('API Error:', error);

    this.errorMessage =
      error.error?.message ||
      error.error?.detail ||
      error.message ||
      'Something went wrong while communicating with the backend.';
  }
}
