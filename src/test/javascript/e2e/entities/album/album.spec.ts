/* tslint:disable no-unused-expression */
import { browser, protractor } from 'protractor';

import NavBarPage from './../../page-objects/navbar-page';
import SignInPage from './../../page-objects/signin-page';
import AlbumComponentsPage from './album.page-object';
import { AlbumDeleteDialog } from './album.page-object';
import AlbumUpdatePage from './album-update.page-object';
import { waitUntilDisplayed, waitUntilHidden } from '../../util/utils';

const expect = chai.expect;

describe('Album e2e test', () => {
  let navBarPage: NavBarPage;
  let signInPage: SignInPage;
  let albumUpdatePage: AlbumUpdatePage;
  let albumComponentsPage: AlbumComponentsPage;
  let albumDeleteDialog: AlbumDeleteDialog;

  before(async () => {
    await browser.get('/');
    navBarPage = new NavBarPage();
    signInPage = await navBarPage.getSignInPage();
    await signInPage.waitUntilDisplayed();

    await signInPage.username.sendKeys('admin');
    await signInPage.password.sendKeys('admin');
    await signInPage.loginButton.click();
    await signInPage.waitUntilHidden();

    await waitUntilDisplayed(navBarPage.entityMenu);
  });

  it('should load Albums', async () => {
    await navBarPage.getEntityPage('album');
    albumComponentsPage = new AlbumComponentsPage();
    expect(await albumComponentsPage.getTitle().getText()).to.match(/Albums/);
  });

  it('should load create Album page', async () => {
    await albumComponentsPage.clickOnCreateButton();
    albumUpdatePage = new AlbumUpdatePage();
    expect(await albumUpdatePage.getPageTitle().getAttribute('id')).to.match(/galleryApp.album.home.createOrEditLabel/);
  });

  it('should create and save Albums', async () => {
    const nbButtonsBeforeCreate = await albumComponentsPage.countDeleteButtons();

    await albumUpdatePage.setTitleInput('title');
    expect(await albumUpdatePage.getTitleInput()).to.match(/title/);
    await albumUpdatePage.setDescriptionInput('description');
    expect(await albumUpdatePage.getDescriptionInput()).to.match(/description/);
    await albumUpdatePage.setCreatedInput('01/01/2001' + protractor.Key.TAB + '02:30AM');
    expect(await albumUpdatePage.getCreatedInput()).to.contain('2001-01-01T02:30');
    await albumUpdatePage.userSelectLastOption();
    await waitUntilDisplayed(albumUpdatePage.getSaveButton());
    await albumUpdatePage.save();
    await waitUntilHidden(albumUpdatePage.getSaveButton());
    expect(await albumUpdatePage.getSaveButton().isPresent()).to.be.false;

    await albumComponentsPage.waitUntilDeleteButtonsLength(nbButtonsBeforeCreate + 1);
    expect(await albumComponentsPage.countDeleteButtons()).to.eq(nbButtonsBeforeCreate + 1);
  });

  it('should delete last Album', async () => {
    await albumComponentsPage.waitUntilLoaded();
    const nbButtonsBeforeDelete = await albumComponentsPage.countDeleteButtons();
    await albumComponentsPage.clickOnLastDeleteButton();

    albumDeleteDialog = new AlbumDeleteDialog();
    expect(await albumDeleteDialog.getDialogTitle().getAttribute('id')).to.match(/galleryApp.album.delete.question/);
    await albumDeleteDialog.clickOnConfirmButton();

    await albumComponentsPage.waitUntilDeleteButtonsLength(nbButtonsBeforeDelete - 1);
    expect(await albumComponentsPage.countDeleteButtons()).to.eq(nbButtonsBeforeDelete - 1);
  });

  after(async () => {
    await navBarPage.autoSignOut();
  });
});
